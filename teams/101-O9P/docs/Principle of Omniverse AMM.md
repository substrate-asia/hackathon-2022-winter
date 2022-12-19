# Designation

## Principle
* [Detailed explanation of Simple AMM](https://github.com/xiyu1984/Blog/blob/main/docs/AMM/uniswap%20explanation.md)

## Key points
### Price
Suppose there are token X and token Y, and the price of X means how many Ys of a token X deserves. Suppose the reserve of X is x, and the reserve of Y is y.  

$$P_{X|Y}(x,y)=\frac{y}{x}$$

### Add pool
Keep the price not change.  
$$\frac{y+\Delta{y}}{x+\Delta{x}}=\frac{y}{x}$$  

The key point of the implementation of the interface `add pool` is that given $x$, $y$ and $\Delta x$, the rest $\Delta y$ can be determined.  

#### Working Flow
* The provider calls `get expected pool` to get $\Delta y$ if input $\Delta x$, and vice versa.
* The provider encapsulates Omniverse Transfer of **both** $X$ and $Y$ from provider's account to swap account(contract MPC wallet account).
* The on-chain swap makes the on-chain checking for the validation of amount $\Delta x$ and $\Delta y$ according to the fomula above.
* The on-chain Omniverse Swap updates and records the new state of the pool.
* The on-chain swap sends the two encapsulated Omniverse Transactions to the related on-chain Omniverse token.
* The Omniverse tokens of $X$ and $Y$ processes the transfers.


### Swap
Keep the liquidity $xy=k$ not change.  
Input $\Delta x$, solve the output of $\Delta y$.  
$$(x+\Delta x)(y-\Delta y)=xy$$  

For instance, given $x$, $y$ and $\Delta x$, the rest $\Delta y$ can be solved as:  
$$\Delta y = y-\frac{xy}{x+\Delta x}=\frac{y\Delta x}{x+\Delta x}$$  

#### Working Flow
* A normal user claims his tokens of $X$ or $Y$ from related on-chain Omniverse tokens.
* A normal user encapsulates an Omniverse trasfer of token $X$ or $Y$ and calls `make swap` on Omniverse Swap.
* The Omniverse Swap calculates the output amount of the opponent token, and generate an on-chain transfer in its pre-transfer cache.
* The off-chain Contract Wallet Account(MPC) makes a signature to the swap transferring out on the Omniverse Swap cache.
* The Omniverse Swap call on-chain Omniverse token to make the transfer.
 
### Half V3
* The initial propotion of $x$ and $y$ is $1:2$, that is, 10,000 $X$ and 20,000 $Y$. So the initial price is $P_{X|Y}=2$. 
* We limit the range of $x:y$ as $[1000:1, 1:1000]$. As a result, the range price of $X$ is $[0.001, 1000]$. If the price exceeds the range, the pool is resetted as $(x=10,000, y=20,000)$.  
