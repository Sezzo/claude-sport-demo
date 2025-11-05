import { Controller, Post, Body } from '@nestjs/common';
import { PrismaService } from './prisma.service';

type Cue = { start: number; end: number; zone: string; label?: string };

@Controller('parser')
export class ParserController {
  constructor(private prisma: PrismaService) {}

  @Post('youtube')
  async parse(@Body() body: { videoId: string; description?: string; duration?: number }) {
    // For autonomy, allow injecting description from sample fixtures to avoid calling YouTube.
    const desc = body.description ?? '';
    const duration = body.duration ?? 1800;
    const cues: Cue[] = this.parseDescription(desc, duration);
    // Persist as cue sheet
    await this.prisma.$transaction(async tx => {
      await tx.videoCue.deleteMany({ where: { youtubeVideoId: body.videoId } });
      for (let i = 0; i < cues.length; i++) {
        const c = cues[i];
        await tx.videoCue.create({
          data: {
            youtubeVideoId: body.videoId,
            segmentIndex: i,
            startS: c.start,
            endS: c.end,
            zoneCode: c.zone,
            label: c.label ?? null
          }
        });
      }
    });
    return { cues, zones: { white: [0, 50], grey: [50, 59], blue: [60, 69], green: [70, 79], yellow: [80, 89], red: [90, 100] } };
  }

  private parseDescription(desc: string, videoDurationSec: number): Cue[] {
    const lines = desc.split('\n').map(l => l.trim()).filter(Boolean);
    const reTs = /((\d{1,2}:)?\d{1,2}:\d{2})\s*(?:[-–—]\s*((\d{1,2}:)?\d{1,2}:\d{2}))?/i;
    const reColor = /(⚪|⚫️|🔵|🟢|🟡|🔴|\bwhite|grey|gray|blue|green|yellow|red\b)/i;
    const map: Record<string, string> = { '⚪':'white','⚫️':'grey','🔵':'blue','🟢':'green','🟡':'yellow','🔴':'red',
      'white':'white','grey':'grey','gray':'grey','blue':'blue','green':'green','yellow':'yellow','red':'red' };
    const toSec = (ts: string) => {
      const parts = ts.split(':').map(Number);
      if (parts.length === 3) return parts[0]*3600 + parts[1]*60 + parts[2];
      return parts[0]*60 + parts[1];
    };
    const out: Cue[] = [];
    for (const line of lines) {
      const mts = line.match(reTs);
      const mc = line.match(reColor);
      if (mts && mc) {
        const start = toSec(mts[1]);
        const end = mts[3] ? toSec(mts[3]) : -1;
        const colorKey = map[mc[1].toLowerCase()] ?? 'grey';
        const label = line.replace(reTs,'').replace(reColor,'').trim();
        out.push({ start, end, zone: colorKey, label });
      }
    }
    out.sort((a,b)=>a.start-b.start);
    for (let i=0;i<out.length;i++){
      if (out[i].end < 0) out[i].end = i < out.length-1 ? out[i+1].start : videoDurationSec;
    }
    return out;
  }
}
