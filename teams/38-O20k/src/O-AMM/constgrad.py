import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.animation as animation

import solving

def drawPoints(axes, x_points, b, C):
    # func_symmetry = np.vectorize(solving.solve_symmetry_const_gradient)
    # y_symmetry = func_symmetry(x_points, b, C)
    
    for i in range(len(x_points)):
        x_show2 = x_points[i]
        print(x_show2)
        y_show2 = solving.solve_symmetry_const_gradient(x_show2, b, C)
        print(y_show2)

        axes.scatter(x_show2, y_show2, s=10, c='red')
        axes.vlines(float(x_show2), 0., float(y_show2), color='lightblue', linestyles = ':', linewidth =0.5)
        axes.hlines(float(y_show2), 0., float(x_show2), color='lightblue', linestyles = ':', linewidth =0.5)
        axes.text(x_show2, y_show2, 'Δx= {}, Δy={}'.format(x_show2, '{:,.{}f}'.format(y_show2, 2)), c='darkgrey')


def animationPoints(fig, axes, x_show, y_show):
    # assert(len(x_show) == len(y_show))

    frames = []
    for i in range(len(x_show)):
        x_show2 = x_show[i]
        y_show2 = y_show[i]
        # frame = axes.vlines(float(x_show2), 0., float(y_show2), color='lightblue', linestyles = ':', linewidth =0.5, animated=True)
        # frame = axes.hlines(float(y_show2), 0., float(x_show2), color='lightblue', linestyles = ':', linewidth =0.5, animated=True)
        # axes.text(x_show2, y_show2, 'Δx= {}, Δy={}'.format(x_show2, '{:,.{}f}'.format(y_show2, 2)), c='darkgrey', animated=True)
        frame = axes.plot(x_show2, y_show2, 'o', c='red', animated=True)
        frames.append(frame)
        # axes.draw_artist(frame)
    
    ani = animation.ArtistAnimation(fig, frames, interval=100, blit=True,
                                repeat=True)


def testAnimation():
    x0 = np.linspace(0, 10, 100)
    y0 = -1 * x0 + 10

    fig, axes = plt.subplots(1, 1)

    axes.plot(x0, y0)

    # animationPoints(fig, axes, x0, y0)

    frames = []
    for i in range(len(x0)):
        x_show2 = x0[i]
        y_show2 = y0[i]
        # frame = axes.vlines(float(x_show2), 0., float(y_show2), color='lightblue', linestyles = ':', linewidth =0.5, animated=True)
        # frame = axes.hlines(float(y_show2), 0., float(x_show2), color='lightblue', linestyles = ':', linewidth =0.5, animated=True)
        # axes.text(x_show2, y_show2, 'Δx= {}, Δy={}'.format(x_show2, '{:,.{}f}'.format(y_show2, 2)), c='darkgrey', animated=True)
        frame = axes.plot(x_show2, y_show2, 'o', c='red', animated=True)
        frames.append(frame)
        # axes.draw_artist(frame)
    
    ani = animation.ArtistAnimation(fig, frames, interval=100, blit=True,
                                repeat=True)

    plt.show()


def testAnimation2():
    x0 = np.linspace(0, 10, 100)
    y0 = -1 * x0 + 10

    fig, axes = plt.subplots(1, 1)

    axes.plot(x0, y0)

    line = axes.plot(x0[0], y0[0], 'o', c='red')[0]

    vline = axes.plot([0, 0], [0, 0], ':', color='lightblue', linewidth =0.8)[0]
    hline = axes.plot([0, 0], [0, 0], ':', color='lightblue', linewidth =0.8)[0]

    text = axes.text(x0[0], y0[0], 'Δx= {}, Δy={}'.format('{:,.{}f}'.format(x0[0], 2), '{:,.{}f}'.format(y0[0], 2)), c='darkgrey')

    def animate(i):
        x_show2 = x0[i]
        y_show2 = y0[i]

        line.set_data(x_show2, y_show2)
        text.set_position((x_show2, y_show2))
        text.set_text('Δx= {}, Δy={}'.format('{:,.{}f}'.format(x0[i], 2), '{:,.{}f}'.format(y0[i], 2)))
        # vline = axes.vlines(float(x_show2), 0., float(y_show2), color='lightblue', linestyles = ':', linewidth =0.5)
        # hline = axes.hlines(float(y_show2), 0., float(x_show2), color='lightblue', linestyles = ':', linewidth =0.5)
        vline.set_data([x_show2, x_show2], [0, y_show2]);
        hline.set_data([0, x_show2], [y_show2, y_show2]);

        return line, text, vline, hline
    
    ani = animation.FuncAnimation(fig, animate, len(y0), interval=100, blit=True,
                                repeat=True)
    
    writergif = animation.PillowWriter(fps=10)
    ani.save('./curve.gif',writer=writergif)

    # plt.rcParams['animation.ffmpeg_path'] ='./tool/bin/ffmpeg.exe'
    # FFwriter=animation.FFMpegWriter(fps=10, extra_args=['-vcodec', 'libx264'])
    # ani.save("movie.mp4", writer=FFwriter)

    plt.show()


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

    # points = np.array([3., 5., 10., 14.1421, 18.39, 26.94, 36.9])
    # drawPoints(axes, points, b, initC1)

    axes.set_xlabel('Reserve X', color="white")
    axes.set_ylabel('Reserve Y', color="white")
    axes.spines['left'].set_color("white")
    axes.spines['bottom'].set_color("white")

    axes.set_aspect(1)
    axes.legend(loc='upper right')
    plt.style.use("dark_background")

    # Animation
    dy_dx_expr = solving.diff_o_amm_dy_dx(b, initC1)

    line = axes.plot(x_symmetry[0], y_symmetry[0], 'o', c='red')[0]

    dy_dx = solving.price_o_amm(x_symmetry[0], y_symmetry[0], dy_dx_expr)
    text = axes.text(x_symmetry[0], y_symmetry[0], 'x= {}, y={}\n Price=dy/dx={}'.format('{:,.{}f}'.format(x_symmetry[0], 2), '{:,.{}f}'.format(y_symmetry[0], 2), '{:,.{}f}'.format(dy_dx, 2)), c='darkgrey')

    vline = axes.plot([0, 0], [0, 0], ':', color='lightblue', linewidth =0.8)[0]
    hline = axes.plot([0, 0], [0, 0], ':', color='lightblue', linewidth =0.8)[0]

    def animate(i):
        x_show2 = x_symmetry[i]
        y_show2 = y_symmetry[i]

        line.set_data(x_show2, y_show2)
        text.set_position((x_show2, y_show2))

        dy_dx = solving.price_o_amm(x_show2, y_show2, dy_dx_expr)
        text.set_text('x= {}, y={}\n Price=dy/dx={}'.format('{:,.{}f}'.format(x_show2, 2), '{:,.{}f}'.format(y_show2, 2), '{:,.{}f}'.format(dy_dx, 2)))
        vline.set_data([x_show2, x_show2], [0, y_show2]);
        hline.set_data([0, x_show2], [y_show2, y_show2]);

        return line, text, vline, hline
    
    ani = animation.FuncAnimation(fig, animate, len(y0), interval=200, blit=True,
                                repeat=True)
    # Animation end

    # writergif = animation.PillowWriter(fps=10)
    # ani.save('./o-amm-curve.gif',writer=writergif)

    # plt.rcParams['animation.ffmpeg_path'] ='./tool/bin/ffmpeg.exe'
    # FFwriter=animation.FFMpegWriter(fps=10, extra_args=['-vcodec', 'libx264'])
    # ani.save("./o-amm-movie.mp4", writer=FFwriter)

    plt.show()

draw()
# testAnimation2()