export const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};

export const identityColorList = [
    "blue",
    "yellow",
    "green",
    "red",
    "pink",
    "purple",
    "cyan",
    "orange",
    "brown",
    "gray",
    "magenta",
    "lime"
];

export const colorMap = {
    "人物": "red",
    "序跋": "blue",
    "牌记": "green",
    "径山志": "yellow",
}