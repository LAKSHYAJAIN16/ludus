export default function randomColor(){
    const colors = [
        "lightred",
        "lightgreen",
        "skyblue",
        "lightyellow"
    ]
    
    return colors[Math.floor(Math.random * colors.length)];
}