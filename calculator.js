(function() {
  var ceil, gcd, lcm, mainConfig;

  mainConfig = {
    '1.0': {
      version: '1.0',
      threadsPerWarp: 32,
      warpsPerMultiprocessor: 24,
      threadsPerMultiprocessor: 768,
      threadBlocksPerMultiprocessor: 8,
      sharedMemoryPerMultiprocessor: 16384,
      registerFileSize: 8192,
      registerAllocationUnitSize: 256,
      allocationGranularity: 'block',
      sharedMemoryAllocationUnitSize: 512,
      warpAllocationGranularity: 2,
      maxThreadBlockSize: 512
    },
    '1.1': {
      version: '1.1',
      threadsPerWarp: 32,
      warpsPerMultiprocessor: 24,
      threadsPerMultiprocessor: 768,
      threadBlocksPerMultiprocessor: 8,
      sharedMemoryPerMultiprocessor: 16384,
      registerFileSize: 8192,
      registerAllocationUnitSize: 256,
      allocationGranularity: 'block',
      sharedMemoryAllocationUnitSize: 512,
      warpAllocationGranularity: 2,
      maxThreadBlockSize: 512
    },
    '1.2': {
      version: '1.2',
      threadsPerWarp: 32,
      warpsPerMultiprocessor: 32,
      threadsPerMultiprocessor: 1024,
      threadBlocksPerMultiprocessor: 8,
      sharedMemoryPerMultiprocessor: 16384,
      registerFileSize: 16384,
      registerAllocationUnitSize: 512,
      allocationGranularity: 'block',
      sharedMemoryAllocationUnitSize: 512,
      warpAllocationGranularity: 2,
      maxThreadBlockSize: 512
    },
    '1.3': {
      version: '1.3',
      threadsPerWarp: 32,
      warpsPerMultiprocessor: 32,
      threadsPerMultiprocessor: 1024,
      threadBlocksPerMultiprocessor: 8,
      sharedMemoryPerMultiprocessor: 16384,
      registerFileSize: 16384,
      registerAllocationUnitSize: 512,
      allocationGranularity: 'block',
      sharedMemoryAllocationUnitSize: 512,
      warpAllocationGranularity: 2,
      maxThreadBlockSize: 512
    },
    '2.0': {
      version: '2.0',
      threadsPerWarp: 32,
      warpsPerMultiprocessor: 48,
      threadsPerMultiprocessor: 1536,
      threadBlocksPerMultiprocessor: 8,
      sharedMemoryPerMultiprocessor: 49152,
      registerFileSize: 32768,
      registerAllocationUnitSize: 64,
      allocationGranularity: 'warp',
      sharedMemoryAllocationUnitSize: 128,
      warpAllocationGranularity: 2,
      maxThreadBlockSize: 512
    },
    '2.1': {
      version: '2.1',
      threadsPerWarp: 32,
      warpsPerMultiprocessor: 48,
      threadsPerMultiprocessor: 1536,
      threadBlocksPerMultiprocessor: 8,
      sharedMemoryPerMultiprocessor: 49152,
      registerFileSize: 32768,
      registerAllocationUnitSize: 64,
      allocationGranularity: 'warp',
      sharedMemoryAllocationUnitSize: 128,
      warpAllocationGranularity: 2,
      maxThreadBlockSize: 512
    },
    '3.0': {
      version: '3.0',
      threadsPerWarp: 32,
      warpsPerMultiprocessor: 64,
      threadsPerMultiprocessor: 2048,
      threadBlocksPerMultiprocessor: 16,
      sharedMemoryPerMultiprocessor: 49152,
      registerFileSize: 65536,
      registerAllocationUnitSize: 256,
      allocationGranularity: 'warp',
      sharedMemoryAllocationUnitSize: 256,
      warpAllocationGranularity: 4,
      maxThreadBlockSize: 512
    },
    '3.5': {
      version: '3.5',
      threadsPerWarp: 32,
      warpsPerMultiprocessor: 64,
      threadsPerMultiprocessor: 2048,
      threadBlocksPerMultiprocessor: 16,
      sharedMemoryPerMultiprocessor: 49152,
      registerFileSize: 65536,
      registerAllocationUnitSize: 256,
      allocationGranularity: 'warp',
      sharedMemoryAllocationUnitSize: 256,
      warpAllocationGranularity: 4,
      maxThreadBlockSize: 512
    }
  };

  gcd = function(a, b) {
    var _ref;
    while (b !== 0) {
      _ref = [b, a % b], a = _ref[0], b = _ref[1];
    }
    return a;
  };

  lcm = function(a, b) {
    return a * b / gcd(a, b);
  };

  ceil = function(a, b) {
    return Math.ceil(a / b) * b;
  };

  window.calculate = function(input) {
    var activeThreadBlocksPerMultiprocessor, activeThreadsPerMultiprocessor, activeWarpsPerMultiprocessor, blockRegisters, blockSharedMemory, blockWarps, config, occupancyOfMultiprocessor, output, threadBlocksPerMultiprocessorLimitedByRegistersPerMultiprocessor, threadBlocksPerMultiprocessorLimitedBySharedMemoryPerMultiprocessor, threadBlocksPerMultiprocessorLimitedByWarpsOrBlocksPerMultiprocessor;
    config = mainConfig[input.version];
    blockWarps = function() {
      return Math.ceil(input.threadsPerBlock / config.threadsPerWarp);
    };
    blockRegisters = function() {
      if (config.allocationGranularity === 'block') {
        return ceil(ceil(blockWarps(), config.warpAllocationGranularity) * input.registersPerThread * config.threadsPerWarp, config.registerAllocationUnitSize);
      } else {
        return ceil(input.registersPerThread * config.threadsPerWarp, config.registerAllocationUnitSize) * blockWarps();
      }
    };
    blockSharedMemory = function() {
      return ceil(input.sharedMemoryPerBlock, config.sharedMemoryAllocationUnitSize);
    };
    threadBlocksPerMultiprocessorLimitedByWarpsOrBlocksPerMultiprocessor = function() {
      return Math.min(config.threadBlocksPerMultiprocessor, Math.floor(config.warpsPerMultiprocessor / blockWarps()));
    };
    threadBlocksPerMultiprocessorLimitedByRegistersPerMultiprocessor = function() {
      if (input.registersPerThread > 0) {
        return Math.floor(config.registerFileSize / blockRegisters());
      } else {
        return config.threadBlocksPerMultiprocessor;
      }
    };
    threadBlocksPerMultiprocessorLimitedBySharedMemoryPerMultiprocessor = function() {
      if (input.sharedMemoryPerBlock > 0) {
        return Math.floor(config.sharedMemoryPerMultiprocessor / blockSharedMemory());
      } else {
        return config.threadBlocksPerMultiprocessor;
      }
    };
    activeThreadsPerMultiprocessor = function() {
      return input.threadsPerBlock * activeThreadBlocksPerMultiprocessor();
    };
    activeWarpsPerMultiprocessor = function() {
      return activeThreadBlocksPerMultiprocessor() * blockWarps();
    };
    activeThreadBlocksPerMultiprocessor = function() {
      return Math.min(threadBlocksPerMultiprocessorLimitedByWarpsOrBlocksPerMultiprocessor(), threadBlocksPerMultiprocessorLimitedByRegistersPerMultiprocessor(), threadBlocksPerMultiprocessorLimitedBySharedMemoryPerMultiprocessor());
    };
    occupancyOfMultiprocessor = function() {
      return activeWarpsPerMultiprocessor() / config.warpsPerMultiprocessor;
    };
    output = {
      activeThreadsPerMultiprocessor: activeThreadsPerMultiprocessor(),
      activeWarpsPerMultiprocessor: activeWarpsPerMultiprocessor(),
      activeThreadBlocksPerMultiprocessor: activeThreadBlocksPerMultiprocessor(),
      occupancyOfMultiprocessor: occupancyOfMultiprocessor(),
      blockWarps: blockWarps(),
      blockSharedMemory: blockSharedMemory(),
      blockRegisters: blockRegisters(),
      threadBlocksPerMultiprocessorLimitedByWarpsOrBlocksPerMultiprocessor: threadBlocksPerMultiprocessorLimitedByWarpsOrBlocksPerMultiprocessor(),
      threadBlocksPerMultiprocessorLimitedByRegistersPerMultiprocessor: threadBlocksPerMultiprocessorLimitedByRegistersPerMultiprocessor(),
      threadBlocksPerMultiprocessorLimitedBySharedMemoryPerMultiprocessor: threadBlocksPerMultiprocessorLimitedBySharedMemoryPerMultiprocessor()
    };
    output = _.extend(output, config);
    return output;
  };

  window.calculateGraphs = function(input) {
    var graphWarpOccupancyOfRegistersPerThread, graphWarpOccupancyOfSharedMemoryPerBlock, graphWarpOccupancyOfThreadsPerBlock, output;
    graphWarpOccupancyOfThreadsPerBlock = function() {
      var current, inp, r, threadsPerBlock;
      current = {
        threadsPerBlock: input.threadsPerBlock,
        activeWarpsPerMultiprocessor: window.calculate(input).activeWarpsPerMultiprocessor
      };
      inp = _.clone(input);
      r = [];
      for (threadsPerBlock = 16; threadsPerBlock <= 512; threadsPerBlock += 16) {
        inp.threadsPerBlock = threadsPerBlock;
        r.push({
          threadsPerBlock: threadsPerBlock,
          activeWarpsPerMultiprocessor: window.calculate(inp).activeWarpsPerMultiprocessor
        });
      }
      return {
        data: r,
        current: current
      };
    };
    graphWarpOccupancyOfRegistersPerThread = function() {
      var current, inp, r, registersPerThread;
      current = {
        registersPerThread: input.registersPerThread,
        activeWarpsPerMultiprocessor: window.calculate(input).activeWarpsPerMultiprocessor
      };
      inp = _.clone(input);
      r = [];
      for (registersPerThread = 1; registersPerThread <= 128; registersPerThread++) {
        inp.registersPerThread = registersPerThread;
        r.push({
          registersPerThread: registersPerThread,
          activeWarpsPerMultiprocessor: window.calculate(inp).activeWarpsPerMultiprocessor
        });
      }
      return {
        data: r,
        current: current
      };
    };
    graphWarpOccupancyOfSharedMemoryPerBlock = function() {
      var current, inp, r, sharedMemoryPerBlock, _ref;
      current = {
        sharedMemoryPerBlock: input.sharedMemoryPerBlock,
        activeWarpsPerMultiprocessor: window.calculate(input).activeWarpsPerMultiprocessor
      };
      inp = _.clone(input);
      r = [];
      for (sharedMemoryPerBlock = 512, _ref = 512 * 100; sharedMemoryPerBlock <= _ref; sharedMemoryPerBlock += 512) {
        inp.sharedMemoryPerBlock = sharedMemoryPerBlock;
        r.push({
          sharedMemoryPerBlock: sharedMemoryPerBlock,
          activeWarpsPerMultiprocessor: window.calculate(inp).activeWarpsPerMultiprocessor
        });
      }
      return {
        data: r,
        current: current
      };
    };
    return output = {
      graphWarpOccupancyOfThreadsPerBlock: graphWarpOccupancyOfThreadsPerBlock(),
      graphWarpOccupancyOfRegistersPerThread: graphWarpOccupancyOfRegistersPerThread(),
      graphWarpOccupancyOfSharedMemoryPerBlock: graphWarpOccupancyOfSharedMemoryPerBlock()
    };
  };

}).call(this);
