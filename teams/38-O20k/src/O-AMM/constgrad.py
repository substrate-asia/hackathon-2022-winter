import numpy as np
import matplotlib.pyplot as plt

import solving

def draw():
    initX = 10
    initY = 20
    initC1 = initX * initY

    k = -1
    b = 2 * (initC1 ** 0.5)

    curve_D = b
    curve_A = 20

    initC0 = b

    x0 = np.linspace(0, initC0, 100)
    y0 = k * x0 + b

    x1 = np.linspace(5, 40, 100)
    y1 = initC1 / x1

    # x2 = np.linspace(5, 29.9, 100)
    # func2 = np.vectorize(solving.solve_with_gradient)
    # y2 = func2(k, b, x2, initC1)

    # y3 = np.linspace(5, 29.9, 100)
    # func3 = np.vectorize(solving.solve_with_gradient)
    # x3 = func3(k, b, y3, initC1)

    x_symmetry = np.linspace(2.5, 40, 100)
    func_symmetry = np.vectorize(solving.solve_symmetry_const_gradient)
    y_symmetry = func_symmetry(x_symmetry, b, initC1)

    x_curve = np.linspace(0.2, 40, 100)
    func_curve = np.vectorize(solving.solve_curve)
    y_curve = func_curve(x_curve, curve_D, curve_A)

    fig, axes = plt.subplots(1, 1)

    axes.set_facecolor(color="black")

    axes.plot(x0*1.25, x0*1.25, linestyle=':', color='white', linewidth=0.5)

    axes.plot(x0, y0, label="Constant", linewidth=0.75)
    axes.plot(x1, y1, label="Uniswap", linewidth=0.75)
    # axes.plot(x2, y2, label="x->y: a(x+y)+(1-a)xy=C")
    # axes.plot(y2, x2, label="y->x: a(x+y)+(1-a)xy=C")   # The same as x3, y3 because of the Symmetry
    # axes.plot(x3, y3, label="y->x: a(x+y)+(1-a)xy=C", linestyle = ':', linewidth = 3)
    axes.plot(x_symmetry, y_symmetry, label="O-AMM", linewidth=1.5, color='lightcyan')
    axes.plot(x_curve, y_curve, label="Curve", linewidth=0.75)

    axes.set_xlabel('Reserve X', color="white")
    axes.set_ylabel('Reserve Y', color="white")
    axes.spines['left'].set_color("white")
    axes.spines['bottom'].set_color("white")

    axes.set_aspect(1)
    axes.legend(loc='upper right')
    plt.style.use("dark_background")
    plt.show()

draw()