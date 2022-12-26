package com.polkadot.bt.ext;

import android.app.Activity;
import android.app.ActivityManager;
import android.content.Context;

import com.polkadot.bt.App;

import java.util.LinkedList;
import java.util.List;

/**
 * 应用程序Activity管理类
 *
 */
public class AppManager {

    private List<Activity> activityList = new LinkedList<>();

    private static AppManager instance;

    private AppManager() {
    }

    private static synchronized void syncInit() {
        if (instance == null) {
            instance = new AppManager();
        }
    }

    public static AppManager getInstance() {
        if (instance == null) {
            syncInit();
        }
        return instance;
    }

    // 添加Activity 到容器中
    public void addActivity(Activity activity) {
        activityList.add(activity);
    }

    public void removeActivity(Activity activity) {
        activityList.remove(activity);
    }

    /**
     * 通过完整的类名找到Activity
     */
    public Activity findActivityByClassName(Class<?> clazz) {

        for (Activity activity : activityList) {
            if (activity.getClass().getName().equals(clazz.getName())) {
                return activity;
            }
        }

        return null;
    }

    /**
     * 除了该activity关闭其余activity
     */
    public void finishALlActivityExceptClassName(Class<?> clazz) {
        for (Activity activity : activityList) {
            if (!activity.getClass().getName().equals(clazz.getName())) {
                activity.finish();
            }
        }
    }

    /**
     * 根据类名关闭activity
     */
    public void finishActivitysByClassName(Class<?>... className) {
        for (int i = 0; i < className.length; i++) {
            Activity activity = findActivityByClassName(className[i]);
            if (activity != null) {
                activity.finish();
            }
        }
    }

    /**
     * 得到当前的activity
     */
    private Activity getCurrentActivity() {
        if (activityList == null || activityList.size() == 0) return null;
        return activityList.get(activityList.size() - 1);
    }


    /**
     * 退出系统
     */
    public void exit() {
        finishAllActivity();
        ((ActivityManager) App.getContext().getSystemService(Context.ACTIVITY_SERVICE)).getAppTasks().forEach(appTask -> appTask.finishAndRemoveTask());
    }

    /**
     * 退出系统
     */
    public void exit0() {
        finishAllActivity();
        System.exit(0);
    }

    /**
     * 关闭所有activity
     */
    public void finishAllActivity() {
        for (Activity activity : activityList) {
            activity.finish();
        }
    }

    /**
     * 关闭所有activity除了传入的activity
     *
     * @param eActivity 不关闭的activity
     */
    public void finishAllActivityExcept(Activity eActivity) {

        for (Activity activity : activityList) {
            if (!activity.equals(eActivity))
                activity.finish();
        }
    }

    /**
     * 判断activity是否已经存在
     */
    public boolean activityExists(Class<?> clazz) {
        for (Activity activity : activityList) {
            if (activity.getClass().getName().equals(clazz.getName()))
                return true;
        }
        return false;
    }
}
