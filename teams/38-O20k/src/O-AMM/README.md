# Omniverse-AMM
We provide a prototype to intuitively show the mathematic features of the `O-AMM` model.  

## Prepare
To run the demo, it needs the environment of `Python` with packages including [Numpy](https://numpy.org/), [matplotlib](https://matplotlib.org/), [sympy](https://www.sympy.org/en/index.html), and the packages they depend on. 
We recommend you install the [Anaconda](https://www.anaconda.com/).  

* Details of installing `Anaconda` can be found [here](https://www.anaconda.com/products/distribution#Downloads)
* Details of installing `sympy` can be found [here](https://docs.sympy.org/latest/install.html). Note that if this doesn't work, go to command line within the `Anaconda environment` and use `pip` to install it instead.  

## Source Code
* The *Equation.1* of `O-AMM` detail mentioned in [Principle of Omniverse AMM](../../docs/Principle%20of%20Omniverse%20AMM.md#equation.1) can be found in [solving.py](./solving.py#L28).
* In [constgrad.py](./constgrad.py) we compared `O-AMM` with `Uniswap` and `Curve`.   

## Running
```sh
# activate the environment of your `python`. `base` for example
conda activate base

# run the script
python.exe ./constgrad.py
```
