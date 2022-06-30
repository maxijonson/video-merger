const createFfmpegCommand = (listPath: string, outputPath: string) =>
    `ffmpeg -f concat -safe 0 -i ${listPath} -c copy ${outputPath}`;

export default createFfmpegCommand;
