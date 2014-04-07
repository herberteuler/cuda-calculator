(function() {
  var ceil, floor, gcd, lcm, mainConfig;

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
      maxRegistersPerThread: 124,
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
      maxRegistersPerThread: 124,
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
      maxRegistersPerThread: 124,
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
      maxRegistersPerThread: 124,
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
      maxRegistersPerThread: 63,
      sharedMemoryAllocationUnitSize: 128,
      warpAllocationGranularity: 2,
      maxThreadBlockSize: 1024
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
      maxRegistersPerThread: 63,
      sharedMemoryAllocationUnitSize: 128,
      warpAllocationGranularity: 2,
      maxThreadBlockSize: 1024
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
      maxRegistersPerThread: 63,
      sharedMemoryAllocationUnitSize: 256,
      warpAllocationGranularity: 4,
      maxThreadBlockSize: 1024
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
      maxRegistersPerThread: 255,
      sharedMemoryAllocationUnitSize: 256,
      warpAllocationGranularity: 4,
      maxThreadBlockSize: 1024
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

  floor = function(a, b) {
    return Math.floor(a / b) * b;
  };

  window.calculate = function(input) {
    var activeThreadBlocksPerMultiprocessor, activeThreadsPerMultiprocessor, activeWarpsPerMultiprocessor, blockRegisters, blockSharedMemory, blockWarps, config, multiprocessorRegisters, occupancyOfMultiprocessor, output, threadBlocksPerMultiprocessorLimitedByRegistersPerMultiprocessor, threadBlocksPerMultiprocessorLimitedBySharedMemoryPerMultiprocessor, threadBlocksPerMultiprocessorLimitedByWarpsOrBlocksPerMultiprocessor;
    config = mainConfig[input.version];
    blockWarps = function() {
      return Math.ceil(input.threadsPerBlock / config.threadsPerWarp);
    };
    blockRegisters = function() {
      if (config.allocationGranularity === 'block') {
        return ceil(ceil(blockWarps(), config.warpAllocationGranularity) * input.registersPerThread * config.threadsPerWarp, config.registerAllocationUnitSize);
      } else {
        return blockWarps();
      }
    };
    multiprocessorRegisters = function() {
      if (config.allocationGranularity === 'block') {
        return config.registerFileSize;
      } else {
        return floor(config.registerFileSize / ceil(input.registersPerThread * config.threadsPerWarp, config.registerAllocationUnitSize), config.warpAllocationGranularity);
      }
    };
    blockSharedMemory = function() {
      return ceil(input.sharedMemoryPerBlock, config.sharedMemoryAllocationUnitSize);
    };
    threadBlocksPerMultiprocessorLimitedByWarpsOrBlocksPerMultiprocessor = function() {
      return Math.min(config.threadBlocksPerMultiprocessor, Math.floor(config.warpsPerMultiprocessor / blockWarps()));
    };
    threadBlocksPerMultiprocessorLimitedByRegistersPerMultiprocessor = function() {
      if (input.registersPerThread > config.maxRegistersPerThread) {
        return 0;
      } else {
        if (input.registersPerThread > 0) {
          return Math.floor(multiprocessorRegisters() / blockRegisters());
        } else {
          return config.threadBlocksPerMultiprocessor;
        }
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
    var config, graphWarpOccupancyOfRegistersPerThread, graphWarpOccupancyOfSharedMemoryPerBlock, graphWarpOccupancyOfThreadsPerBlock, output;
    config = mainConfig[input.version];
    graphWarpOccupancyOfThreadsPerBlock = function() {
      var current, inp, r, threadsPerBlock, _ref;
      current = {
        threadsPerBlock: input.threadsPerBlock,
        activeWarpsPerMultiprocessor: window.calculate(input).activeWarpsPerMultiprocessor
      };
      inp = _.clone(input);
      r = [];
      for (threadsPerBlock = 32, _ref = config.maxThreadBlockSize; threadsPerBlock <= _ref; threadsPerBlock += 32) {
        inp.threadsPerBlock = threadsPerBlock;
        r.push({
          threadsPerBlock: threadsPerBlock,
          activeWarpsPerMultiprocessor: window.calculate(inp).activeWarpsPerMultiprocessor
        });
      }
      return {
        xlabel: "Threads Per Block",
        data: r,
        current: current
      };
    };
    graphWarpOccupancyOfRegistersPerThread = function() {
      var current, inp, r, registersPerThread, _ref;
      current = {
        registersPerThread: input.registersPerThread,
        activeWarpsPerMultiprocessor: window.calculate(input).activeWarpsPerMultiprocessor
      };
      inp = _.clone(input);
      r = [];
      for (registersPerThread = 1, _ref = config.maxRegistersPerThread; 1 <= _ref ? registersPerThread <= _ref : registersPerThread >= _ref; 1 <= _ref ? registersPerThread++ : registersPerThread--) {
        inp.registersPerThread = registersPerThread;
        r.push({
          registersPerThread: registersPerThread,
          activeWarpsPerMultiprocessor: window.calculate(inp).activeWarpsPerMultiprocessor
        });
      }
      return {
        xlabel: "Registers Per Thread",
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
      for (sharedMemoryPerBlock = 0, _ref = config.sharedMemoryPerMultiprocessor; sharedMemoryPerBlock <= _ref; sharedMemoryPerBlock += 512) {
        inp.sharedMemoryPerBlock = sharedMemoryPerBlock;
        r.push({
          sharedMemoryPerBlock: sharedMemoryPerBlock,
          activeWarpsPerMultiprocessor: window.calculate(inp).activeWarpsPerMultiprocessor
        });
      }
      return {
        xlabel: "Shared Memory Per Block",
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
