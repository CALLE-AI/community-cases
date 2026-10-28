// Media seconds -> choreography seconds, aligned to spoken phrases rather than equal quarters.
export const timing = {
    office: {
        chapters: [0, 8, 13, 19.3], previews: [5, 11.6, 14.4, 22],
        points: [[0, 0], [8, 6.25], [11.5, 8.5], [12.6, 10], [13, 11], [14.35, 14], [15, 16], [18.6, 19], [21, 23], [25, 25]]
    },
    care: {
        chapters: [0, 5, 11, 17], previews: [2, 8.5, 14, 22],
        points: [[0, 0], [.8, 4], [5, 5], [6, 6], [8, 7], [8.4, 8], [10.5, 11], [11, 12.5], [11.8, 13.5], [12.4, 14], [13.1, 15], [14.2, 16], [14.9, 18], [17, 20], [19.5, 23], [25, 25]]
    },
    restaurants: {
        chapters: [0, 5, 12, 18], previews: [2, 9.3, 15, 22],
        points: [[0, 0], [5, 6.25], [6.4, 7], [8, 9.5], [9, 10.2], [12, 12.5], [14.5, 15], [16.5, 17], [18, 18], [21.5, 21], [25, 25]]
    }
};
export function chapterAt(kind, seconds) {
    return Math.max(0, timing[kind].chapters.findLastIndex(start => seconds >= start));
}
export function storyTime(kind, seconds) {
    const points = timing[kind].points;
    const time = Math.max(0, Math.min(25, seconds));
    for (let i = 1; i < points.length; i++) {
        const [end, poseEnd] = points[i], [start, poseStart] = points[i - 1];
        if (time <= end)
            return poseStart + (poseEnd - poseStart) * (time - start) / (end - start);
    }
    return 25;
}
