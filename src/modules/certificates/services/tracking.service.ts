import type { TrackingData, ChapterDetail } from '../dtos/tracking.dto';
import { trackingMock } from '../mocks/tracking';
import { chapterDetailsMock } from '../mocks/chapterDetails';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

class TrackingService {
  async getTrackingData(): Promise<TrackingData> {
    await delay(600);
    return trackingMock;
  }

  async getChapterDetail(chapterId: number): Promise<ChapterDetail | undefined> {
    await delay(400);
    return chapterDetailsMock[chapterId];
  }
}

export const trackingService = new TrackingService();
