const createFfmpegCommand = (filePaths: string[], outputPath: string) => {
    const input = filePaths.map((f) => f.replace(/\\/g, "/")).join("|");
    return `ffmpeg -i "concat:${input}" -c copy ${outputPath}`;
};

export default createFfmpegCommand;
