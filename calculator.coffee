mainConfig =
    '1.0':
        version: '1.0'
        threadsPerWarp: 32
        warpsPerMultiprocessor: 24
        threadsPerMultiprocessor: 768
        threadBlocksPerMultiprocessor: 8
        sharedMemoryPerMultiprocessor: 16384

        registerFileSize: 8192
        registerAllocationUnitSize: 256

        allocationGranularity: 'block'
        maxRegistersPerThread: 124
        sharedMemoryAllocationUnitSize: 512
        warpAllocationGranularity: 2
        maxThreadBlockSize: 512

    '1.1':
        version: '1.1'
        threadsPerWarp: 32
        warpsPerMultiprocessor: 24
        threadsPerMultiprocessor: 768
        threadBlocksPerMultiprocessor: 8
        sharedMemoryPerMultiprocessor: 16384

        registerFileSize: 8192
        registerAllocationUnitSize: 256

        allocationGranularity: 'block'
        maxRegistersPerThread: 124
        sharedMemoryAllocationUnitSize: 512
        warpAllocationGranularity: 2
        maxThreadBlockSize: 512

    '1.2':
        version: '1.2'
        threadsPerWarp: 32
        warpsPerMultiprocessor: 32
        threadsPerMultiprocessor: 1024
        threadBlocksPerMultiprocessor: 8
        sharedMemoryPerMultiprocessor: 16384

        registerFileSize: 16384
        registerAllocationUnitSize: 512

        allocationGranularity: 'block'
        maxRegistersPerThread: 124
        sharedMemoryAllocationUnitSize: 512
        warpAllocationGranularity: 2
        maxThreadBlockSize: 512

    '1.3':
        version: '1.3'
        threadsPerWarp: 32
        warpsPerMultiprocessor: 32
        threadsPerMultiprocessor: 1024
        threadBlocksPerMultiprocessor: 8
        sharedMemoryPerMultiprocessor: 16384

        registerFileSize: 16384
        registerAllocationUnitSize: 512

        allocationGranularity: 'block'
        maxRegistersPerThread: 124
        sharedMemoryAllocationUnitSize: 512
        warpAllocationGranularity: 2
        maxThreadBlockSize: 512

    '2.0':
        version: '2.0'
        threadsPerWarp: 32
        warpsPerMultiprocessor: 48
        threadsPerMultiprocessor: 1536
        threadBlocksPerMultiprocessor: 8
        sharedMemoryPerMultiprocessor: 49152

        registerFileSize: 32768
        registerAllocationUnitSize: 64

        allocationGranularity: 'warp'
        maxRegistersPerThread: 63
        sharedMemoryAllocationUnitSize: 128
        warpAllocationGranularity: 2
        maxThreadBlockSize: 1024

    '2.1':
        version: '2.1'
        threadsPerWarp: 32
        warpsPerMultiprocessor: 48
        threadsPerMultiprocessor: 1536
        threadBlocksPerMultiprocessor: 8
        sharedMemoryPerMultiprocessor: 49152

        registerFileSize: 32768
        registerAllocationUnitSize: 64

        allocationGranularity: 'warp'
        maxRegistersPerThread: 63
        sharedMemoryAllocationUnitSize: 128
        warpAllocationGranularity: 2
        maxThreadBlockSize: 1024

    '3.0':
        version: '3.0'
        threadsPerWarp: 32
        warpsPerMultiprocessor: 64
        threadsPerMultiprocessor: 2048
        threadBlocksPerMultiprocessor: 16
        sharedMemoryPerMultiprocessor: 49152

        registerFileSize: 65536
        registerAllocationUnitSize: 256

        allocationGranularity: 'warp'
        maxRegistersPerThread: 63
        sharedMemoryAllocationUnitSize: 256
        warpAllocationGranularity: 4
        maxThreadBlockSize: 1024

    '3.5':
        version: '3.5'
        threadsPerWarp: 32
        warpsPerMultiprocessor: 64
        threadsPerMultiprocessor: 2048
        threadBlocksPerMultiprocessor: 16
        sharedMemoryPerMultiprocessor: 49152

        registerFileSize: 65536
        registerAllocationUnitSize: 256

        allocationGranularity: 'warp'
        maxRegistersPerThread: 255
        sharedMemoryAllocationUnitSize: 256
        warpAllocationGranularity: 4
        maxThreadBlockSize: 1024



gcd = (a,b) ->
    while (b != 0)
        [a, b] = [b, a % b]
        # b = a % b
        # a = t
    return a

lcm = (a,b) ->
    a*b / gcd(a,b)

ceil = (a,b) ->
    return Math.ceil(a / b) * b

floor = (a,b) ->
    return Math.floor(a / b) * b


window.calculate = (input) ->

    config = mainConfig[input.version]

    blockWarps = () ->
        Math.ceil(input.threadsPerBlock / config.threadsPerWarp)

    blockRegisters = () ->
        if config.allocationGranularity == 'block'
            ceil( ceil( blockWarps(), config.warpAllocationGranularity ) * input.registersPerThread * config.threadsPerWarp, config.registerAllocationUnitSize )
            # debugger
        else
            #Correct value is commented, xls value is given (no of warps per block)
            #ceil(input.registersPerThread * config.threadsPerWarp, config.registerAllocationUnitSize) * blockWarps()
            blockWarps()

    multiprocessorRegisters = () ->
        if config.allocationGranularity == 'block'
            config.registerFileSize
        else
            #Correct value is commented, xls value is given (no of warps per Multiprocessor)
            #floor( config.registerFileSize/ ceil(input.registersPerThread * config.threadsPerWarp, config.registerAllocationUnitSize), config.warpAllocationGranularity ) * ceil(input.registersPerThread * config.threadsPerWarp, config.registerAllocationUnitSize)
            floor( config.registerFileSize/ ceil(input.registersPerThread * config.threadsPerWarp, config.registerAllocationUnitSize), config.warpAllocationGranularity )

    blockSharedMemory = () ->
        ceil(input.sharedMemoryPerBlock, config.sharedMemoryAllocationUnitSize)

    threadBlocksPerMultiprocessorLimitedByWarpsOrBlocksPerMultiprocessor = () ->
        Math.min(config.threadBlocksPerMultiprocessor, Math.floor(config.warpsPerMultiprocessor / blockWarps()))

    threadBlocksPerMultiprocessorLimitedByRegistersPerMultiprocessor = () ->
        if input.registersPerThread > config.maxRegistersPerThread
            0
        else
            if input.registersPerThread > 0
                #Math.floor( config.registerFileSize  / blockRegisters())
                Math.floor(multiprocessorRegisters() / blockRegisters())
            else
                config.threadBlocksPerMultiprocessor

    threadBlocksPerMultiprocessorLimitedBySharedMemoryPerMultiprocessor = () ->
        if input.sharedMemoryPerBlock > 0
            Math.floor(config.sharedMemoryPerMultiprocessor / blockSharedMemory())
        else
            config.threadBlocksPerMultiprocessor

    activeThreadsPerMultiprocessor = () ->
        input.threadsPerBlock * activeThreadBlocksPerMultiprocessor()

    activeWarpsPerMultiprocessor = () ->
        activeThreadBlocksPerMultiprocessor() * blockWarps()

    activeThreadBlocksPerMultiprocessor = () ->
        Math.min(
            threadBlocksPerMultiprocessorLimitedByWarpsOrBlocksPerMultiprocessor(),
            threadBlocksPerMultiprocessorLimitedByRegistersPerMultiprocessor(),
            threadBlocksPerMultiprocessorLimitedBySharedMemoryPerMultiprocessor()
        )

    occupancyOfMultiprocessor = () ->
        activeWarpsPerMultiprocessor() / config.warpsPerMultiprocessor


    output =
        activeThreadsPerMultiprocessor: activeThreadsPerMultiprocessor()
        activeWarpsPerMultiprocessor: activeWarpsPerMultiprocessor()
        activeThreadBlocksPerMultiprocessor: activeThreadBlocksPerMultiprocessor()
        occupancyOfMultiprocessor: occupancyOfMultiprocessor()

        blockWarps:         blockWarps()
        blockSharedMemory:  blockSharedMemory()
        blockRegisters:     blockRegisters()

        threadBlocksPerMultiprocessorLimitedByWarpsOrBlocksPerMultiprocessor: threadBlocksPerMultiprocessorLimitedByWarpsOrBlocksPerMultiprocessor()
        threadBlocksPerMultiprocessorLimitedByRegistersPerMultiprocessor: threadBlocksPerMultiprocessorLimitedByRegistersPerMultiprocessor()
        threadBlocksPerMultiprocessorLimitedBySharedMemoryPerMultiprocessor: threadBlocksPerMultiprocessorLimitedBySharedMemoryPerMultiprocessor()



    output = _.extend output, config

    return output

window.calculateGraphs = (input) ->

    config = mainConfig[input.version]

    graphWarpOccupancyOfThreadsPerBlock = () ->

        current =
            threadsPerBlock: input.threadsPerBlock
            activeWarpsPerMultiprocessor: window.calculate(input).activeWarpsPerMultiprocessor

        inp = _.clone input
        r = []
        for threadsPerBlock in [32..config.maxThreadBlockSize] by 32
            inp.threadsPerBlock = threadsPerBlock

            r.push({
                threadsPerBlock: threadsPerBlock
                activeWarpsPerMultiprocessor: window.calculate(inp).activeWarpsPerMultiprocessor
            })

        return {
            data: r
            current: current
        }

    graphWarpOccupancyOfRegistersPerThread = () ->

        current =
            registersPerThread: input.registersPerThread
            activeWarpsPerMultiprocessor: window.calculate(input).activeWarpsPerMultiprocessor

        inp = _.clone input
        r = []
        for registersPerThread in [1..config.maxRegistersPerThread]
            inp.registersPerThread = registersPerThread

            r.push({
                registersPerThread: registersPerThread
                activeWarpsPerMultiprocessor: window.calculate(inp).activeWarpsPerMultiprocessor
            })

        return {
            data: r
            current: current
        }


    graphWarpOccupancyOfSharedMemoryPerBlock = () ->

        current =
            sharedMemoryPerBlock: input.sharedMemoryPerBlock
            activeWarpsPerMultiprocessor: window.calculate(input).activeWarpsPerMultiprocessor


        inp = _.clone input
        r = []
        for sharedMemoryPerBlock in [0..config.sharedMemoryPerMultiprocessor] by 512
            inp.sharedMemoryPerBlock = sharedMemoryPerBlock

            r.push({
                sharedMemoryPerBlock: sharedMemoryPerBlock
                activeWarpsPerMultiprocessor: window.calculate(inp).activeWarpsPerMultiprocessor
            })

        return {
            data: r
            current: current
        }

    output =
        graphWarpOccupancyOfThreadsPerBlock: graphWarpOccupancyOfThreadsPerBlock()
        graphWarpOccupancyOfRegistersPerThread: graphWarpOccupancyOfRegistersPerThread()
        graphWarpOccupancyOfSharedMemoryPerBlock: graphWarpOccupancyOfSharedMemoryPerBlock()

