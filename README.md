HTML/JS port of CUDA Occupancy Calculator
-----------------------------------------
http://developer.download.nvidia.com/compute/cuda/CUDA_Occupancy_calculator.xls

Usage:
------
Online here http://lxkarthi.github.io/cuda-calculator/

Changes:
--------
- Extended till Compute 3.5
- limitBlocksDuetoRegs updated as per CUDA_Occupancy_calculator.xls(7-Apr-2014) (zero conditions)
   (xls file has bug in calculating no of registers per multiprocessor, per block if allocation granularity=="warp")
- TODO Graph change & plot

Credits:
--------

* [Karthikeyan](https://github.com/lxkarthi/cuda-calculator) - Improved cuda-calculator online version.
* [Aliaksei](http://github.com/roadhump) - Original Author deleted it. :(
* [Mihai Maruseac](https://github.com/mihaimaruseac/cuda-calculator) - Thanks for the fork.

