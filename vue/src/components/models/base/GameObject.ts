class GameObject {
    readonly icon: URL
    readonly x: int
    readonly y: int
    readonly width: int
    readonly height: int

    constructor(x: int, y: int, width: int, height: int, icon: URL) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.icon = icon;
    }
}