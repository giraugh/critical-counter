const symbols = {
    progress: {
        empty: '░',
        half: '▓',
        full: '█',
    }
}

interface GraphOptions {
    barLength : number
}

export const makeGraph = (results : Map<string, number>, options : GraphOptions) => {
    // Manage options
    const barLength = options.barLength ?? 10

    // Prep keys (sort bars by length)
    const keys = [...results.keys()].sort((a, b) => (results.get(b)||0) - (results.get(a)||0))
    const longestKeyLength = keys.sort((a, b) => b.length - a.length)[0].length

    // Calculate total
    const total = [...results.values()].reduce((a, b) => a + b)

    // Create each line
    const bars = [...results.entries()].map(([key, count]) => {
        const progress = total > 0 ? count / total : 0
        const cellSize = 1 / barLength
        const bar = Array.from({ length: barLength }).map((_,i)=>i).map(i => {
            const x = cellSize * i
            if (progress >= x)
                return symbols.progress.full
            else if (progress >= x - cellSize/2 && progress < x)
                return symbols.progress.half
            else
                return symbols.progress.empty
        })
        
        const k = key.padEnd(longestKeyLength + 2)
        const v = String(Math.floor(progress * 100)).padStart(3)
        const b = bar.join('')
        return `\`${k} ${b} ${v}% (${count})\``
    })
    
    return bars.join('\n')
}
