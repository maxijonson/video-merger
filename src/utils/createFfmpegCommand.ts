const createFfmpegCommand = (filePaths: string[], outputPath: string) => {
    const input = filePaths
        .map((f) => `-i "${f.replace(/\\/g, "/")}"`)
        .join(" ");
    const n = filePaths.length;
    return `ffmpeg ${input} -filter_complex "concat=n=${n}:v=1:a=1" -y ${outputPath}`;
};

export default createFfmpegCommand;
