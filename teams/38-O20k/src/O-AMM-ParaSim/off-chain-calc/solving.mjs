import nerdamer from 'nerdamer'; 
// Load additional modules. These are not required.  
import 'nerdamer/Algebra.js'; 
import 'nerdamer/Calculus.js'; 
import 'nerdamer/Solve.js'; 
import 'nerdamer/Extra.js';
// import 'nerdamer/Diff.js';

// `token={t_name: .. , t_value: ..}`
export async function solve_O_AMM(token, b, C) {
    var other = nerdamer.solveEquations(['a=x*y/(((x+y)/2)^2)', 'a*(-(x**2+y**2)+b*(x+y)) + 2*(1-a)*C=2*x*y', `${token.t_name}=${token.t_value}`, `b=${b}`, `C=${C}`]);
    // console.log(x)
    return other;
}

export async function get_price(x, y, b, C) {
    // Note that there must not be any `spaces`
    const expr = '(x*y/(((x+y)/2)^2))*(-(x**2+y**2)+b*(x+y))+2*(1-(x*y/(((x+y)/2)^2)))*C-2*x*y';

    const dzdx = nerdamer.diff(expr, 'x', 1);
    // console.log(dzdx.toString());
    const zx = nerdamer.solveEquations(['z='+dzdx.toString(), `x=${x}`, `y=${y}`, `b=${b}`, `C=${C}`]);
    // console.log(zx);
    const dzdy = nerdamer.diff(expr, 'y', 1);
    // console.log(dzdy.toString());
    const zy = nerdamer.solveEquations(['z='+dzdy.toString(), `x=${x}`, `y=${y}`, `b=${b}`, `C=${C}`]);
    // console.log(zy);

    const price = -get_result('z', zx)/get_result('z', zy);
    // console.log(price);

    return price;
}

export function get_result(symbol, rsts) {
    // console.log(rsts)
    for (var idx in rsts) {
        // console.log(rsts[idx]);
        if (rsts[idx][0] == symbol) {
            return rsts[idx][1];
        }
    }
}

// @inToken: {t_name: .., dx: .., x: ..}
// @b, @C and the balance of the @input token need to be achieved on-chain
// return: swap out token, [`balance before swap`, `swap out amount`]
export async function swap(inToken, b, C) {
    const y_src = await solve_O_AMM({t_name: inToken.t_name, t_value: inToken.x}, b, C);
    let y = get_result('y', y_src);

    const y_after = await solve_O_AMM({t_name: inToken.t_name, t_value: inToken.x + inToken.dx}, b, C);
    // console.log(y, inToken.x, inToken.dx, b, C, y_after);
    const dy = y - get_result('y', y_after);
    return [y, dy];
}

async function test_swap() {
    let x = 10000;
    let y = 20000;

    let C = x * y;
    let b = 2 * Math.sqrt(C);

    const x_in = 10100;
    const dx = 100;
    let y_out = await swap({t_name: 'x', x: x_in, dx: dx}, b, C);

    // console.log(y_out);
    console.log(`in:  x: ${x_in.toFixed(4)}, dx: ${dx.toFixed(4)}\nout: y: ${y_out[0].toFixed(4)}, dy: ${y_out[1].toFixed(4)}`);

    // const y_to_validate = await solve_O_AMM({t_name: 'x', t_value: x_in}, b, C);
    // const y_to_v = get_result('y', y_to_validate);
    console.log(await validate(dx * 10000, x_in, y_out[1] * 10000, y_out[0], b, C));
}

async function validate(dx, x, dy, y, b, C) {
    const precise = 10000;
    const in_t_amount = x * precise + dx;
    // console.log(await solve_O_AMM({t_name: 'x', t_value: in_t_amount}, b, C))
    const out_t_amount = y * precise - dy;
    console.log(out_t_amount);
    
    let m = in_t_amount * out_t_amount;
    let s = in_t_amount + out_t_amount;

    let coe = 10000;

    let a = 4 * m * coe / (s * s);
    console.log(s * s);

    let ms = m * s;

    console.log(dx, x, dy, y, m, s, a, b, C);

    // let l = ms + a * 2 * s * ms / coe + C * s * a / coe;
    // console.log(l);
    // let r = a * ms / coe + a * 2 * b * ms / coe + C * s;
    // console.log(r);

    const p2 = precise * precise;

    let l = 2 * m / p2 + a * (in_t_amount * in_t_amount + out_t_amount * out_t_amount) / (coe * p2) + 2 * a * C / coe;
    console.log(l);
    let r = a * b * s / (coe * precise) + 2 * C;
    console.log(r);

    let delta = 0;
    if (l > r) {
        delta = l - r;
    } else if (r > l) {
        delta = r - l;
    }

    if (delta < coe) {
        return true;
    } else {
        return false;
    }
}

async function test_price() {
    let x = 10;
    let y = 20;

    let C = x * y;
    let b = 2 * Math.sqrt(C);

    let x_val = 1;
    let y_src = await solve_O_AMM_from_X(x_val, b, C);
    let y_val = get_result('y', y_src);
    // console.log(y_val);
    
    await get_price(x_val, y_val, b, C);
}

async function test_s_o_amm() {
    let x = 10;
    let y = 20;

    let C = x * y;
    let b = 2 * Math.sqrt(C);

    await solve_O_AMM_from_X(x, b, C);
    await solve_O_AMM_from_Y(y, b, C);
}

// await solve();


// await test_s_o_amm();
// await test_price();
// await test_swap();
