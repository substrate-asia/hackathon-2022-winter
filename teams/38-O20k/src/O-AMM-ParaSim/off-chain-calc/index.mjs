import {program} from 'commander';
import * as solving from "./solving.mjs";

async function calc_price(x, b, C) {
    let real_b = b / 10000;
    let y_src = await solving.solve_O_AMM({t_name: 'x', t_value: x}, real_b, C);
    let y = solving.get_result('y', y_src);
    console.log(`The amount of the input token is: ${x}`);
    console.log(`The virtual amount of the other token is: ${y}`);
    let price = await solving.get_price(x, y, real_b, C);
    console.log(`The price of the input token is: ${price}`);
}

async function calc_swap(dx, x, b, C, inTokenName, outTokenName, poolName) {
    let outToken = await solving.swap({t_name: 'x', dx: dx * 1, x: x * 1}, b / 10000, C * 1);
    console.log("--------------The input token information----------------");
    console.log(`Current amount of the input token is: ${x}`);
    console.log(`The real input Δamount of the input token is ${dx}. The parameter for on-chain call needs to be ${dx * 10000}`);

    console.log("--------------The output token information----------------");
    console.log(`The calculated output Δamount of the token to be swapped out is ${outToken[1]}. The parameter for on-chain call needs to be ${outToken[1] * 10000}`);
    console.log(`The virtual amount of the output token is: ${outToken[0]}. The parameter for on-chain call needs to be ${outToken[0]*10000}`);

    console.log("--------------Full parameters for on-chain call----------------");
    console.log({
        'poolName': poolName,
        'dIn.t_name': inTokenName,
        'dIn.t_value': dx * 10000,
        'dOut.t_name': outTokenName,
        'dOut.t_value': Math.floor(outToken[1] * 10000),
        'virtualOut': Math.floor(outToken[0]*10000)
    });
}

function list(val) {
    return val.split(',')
}

async function commanders() {
    program
        .version('0.1.0')
        .option('-s, --swap <Δamount>,<amount>,<b>,<C>,<input token name><output token name><pool name>', 'calculate output token Δamount and virtual output token amount, the precision of the output values is 0.0001', list)
        .option('-p, --price <token amount>,<b>,<C>', 'calculate the price of the token', list)
        .parse(process.argv);
        
    if (program.opts().swap) {
        if (program.opts().swap.length != 7) {
            console.log('3 arguments are needed, but ' + program.opts().price.length + ' provided');
            return;
        }

        await calc_swap(program.opts().swap[0], program.opts().swap[1], program.opts().swap[2], program.opts().swap[3], program.opts().swap[4], program.opts().swap[5], program.opts().swap[6]);
        
    } else if (program.opts().price) {
        if (program.opts().price.length != 3) {
            console.log('3 arguments are needed, but ' + program.opts().price.length + ' provided');
            return;
        }

        await calc_price(program.opts().price[0], program.opts().price[1], program.opts().price[2]);
    }
}

await commanders();
