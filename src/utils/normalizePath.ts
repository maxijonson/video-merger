const normalizePath = (path: string): string => {
    return path.replace(/\\/g, "/");
};

export default normalizePath;
