from sympy import symbols, Eq, solve, idiff

# `alpha` is the quotient of the geometric mean over arithmetic mean,
# which is a way to quantify the degree of difference between x and y
def alpha(x, y):
    return (x*y) / (((x+y)/2)**2)

# This is used for reserve `y`` > reserve `x`
def solve_with_gradient(k, b, i, C):
    r = symbols('r', real=True)

    _alpha = alpha(i, r)

    eq = Eq(r - (_alpha * (k*i+b) + (1-_alpha)*C/i), 0)
    s = solve(eq)
    return s[0]

def solve_curve(x, D, A):
    y = symbols('y', real=True)
    eq = Eq((x+y)*A*4 + D, A*D*4 + D**3 / (4*x*y))
    s = solve(eq)
    return s[1]

def solve_symmetry_const_gradient(x, b, C):
    y = symbols('y', real=True)
    _alpha = alpha(x, y)

    eq = Eq(_alpha*(-(x**2+y**2)+b*(x+y)) + 2*(1-_alpha)*C, 2*x*y)

    s = solve(eq)
    return s[0]

def diff_o_amm_dy_dx(b, C):
    y = symbols('y', real=True)
    x = symbols('x', real=True)

    _alpha = alpha(x, y)

    z = _alpha*(-(x**2+y**2)+b*(x+y)) + 2*(1-_alpha)*C - 2*x*y
    # print(idiff(z, y, x))
    return idiff(z, y, x)


def price_o_amm(x_val, y_val, dy_dx_expr):
    y = symbols('y', real=True)
    x = symbols('x', real=True)
    return dy_dx_expr.subs({y: y_val, x: x_val});
