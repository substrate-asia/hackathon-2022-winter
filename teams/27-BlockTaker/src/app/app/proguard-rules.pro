
#基本配置
# 设置混淆的压缩比率 0 ~ 7
-optimizationpasses 5
# 混淆时不使用大小写混合，混淆后的类名为小写
-dontusemixedcaseclassnames
# 指定不去忽略非公共库的类
-dontskipnonpubliclibraryclasses
# 指定不去忽略非公共库的成员
-dontskipnonpubliclibraryclassmembers
# 混淆时不做预校验
-dontpreverify
# 混淆时不记录日志
-verbose
# 代码优化
-dontshrink
# 不优化输入的类文件
-dontoptimize
# 保留注解不混淆
-keepattributes *Annotation*,InnerClasses
# 避免混淆泛型
-keepattributes Signature
# 保留代码行号，方便异常信息的追踪
-keepattributes SourceFile,LineNumberTable
# 混淆采用的算法
-optimizations !code/simplification/cast,!field/*,!class/merging/*

# 保留所有的本地native方法不被混淆
-keepclasseswithmembernames class * {
    native <methods>;
}

# 保留了继承自Activity、Application这些类的子类
# 因为这些子类，都有可能被外部调用
# 比如说，第一行就保证了所有Activity的子类不要被混淆
-keep public class * extends android.app.Activity
-keep public class * extends android.app.Application
-keep public class * extends android.app.Service
-keep public class * extends android.content.BroadcastReceiver
-keep public class * extends android.content.ContentProvider
-keep public class * extends android.app.backup.BackupAgentHelper
-keep public class * extends android.preference.Preference
-keep public class * extends android.view.View
-keep public class com.android.vending.licensing.ILicensingService

# 如果有引用android-support-v4.jar包，可以添加下面这行
#-keep public class com.xxxx.app.ui.fragment.** {*;}

# 保留在Activity中的方法参数是view的方法，
# 从而我们在layout里面编写onClick就不会被影响
-keepclassmembers class * extends android.app.Activity {
    public void *(android.view.View);
}

# 枚举类不能被混淆
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# 保留自定义控件（继承自View）不被混淆
-keep public class * extends android.view.View {
    *** get*();
    void set*(***);
    public <init>(android.content.Context);
    public <init>(android.content.Context, android.util.AttributeSet);
    public <init>(android.content.Context, android.util.AttributeSet, int);
}

# 保留Parcelable序列化的类不被混淆
-keep class * implements android.os.Parcelable {
    public static final android.os.Parcelable$Creator *;
}

# 保留Serializable序列化的类不被混淆
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}

-keep class **.R$* {
    *;
}
-keepclassmembers class * {
    void *(**On*Event);
}
-keep public class com.**bean.** {*;}
-keep public class com.**entities.** {*;}

-keep class com.polkadot.bt.**view.** { *; } #自定义控件不参与混淆
-keep class com.polkadot.bt.custom.** { *; } #自定义控件不参与混淆


# AndroidX混淆
-keep class com.google.android.material.** {*;}
-keep class androidx.** {*;}
-keep public class * extends androidx.**
-keep interface androidx.** {*;}
-dontwarn com.google.android.material.**
-dontnote com.google.android.material.**
-dontwarn androidx.**

#第三方框架
#Okhttp3
-dontwarn okio.**
-dontwarn okhttp3.logging.**
-keep class okhttp3.internal.** {
    *;
}
-dontwarn javax.annotation.**
-dontwarn javax.annotation.Nullable
-dontwarn javax.annotation.ParametersAreNonnullByDefault

#Retrofit2
-dontwarn retrofit2.**
-keep class retrofit2.** {*;}


#Rxjava,RxAndroid
-dontwarn sun.misc.**
-keepclassmembers class rx.internal.util.unsafe.*ArrayQueue*Field* {
   long producerIndex;
   long consumerIndex;
}
-keepclassmembers class rx.internal.util.unsafe.BaseLinkedQueueProducerNodeRef {
    rx.internal.util.atomic.LinkedQueueNode producerNode;
}
-keepclassmembers class rx.internal.util.unsafe.BaseLinkedQueueConsumerNodeRef {
    rx.internal.util.atomic.LinkedQueueNode consumerNode;
}


#Glide4
-keep public class * implements com.bumptech.glide.module.AppGlideModule
-keep public class * implements com.bumptech.glide.module.LibraryGlideModule
-keep public enum com.bumptech.glide.load.ImageHeaderParser$** {
  **[] $VALUES;
  public *;
}

#json
-dontwarn com.google.**
-keep class com.google.gson.** {
    *;
}
-keep class com.google.gson.stream.** {
    *;
}
-keep class com.google.protobuf.** {
    *;
}


# Room 数据库
#-dontwarn android.arch.persistence.room.paging.LimitOffsetDataSource

-libraryjars ./libs/utrev-sdk-chain.main.jar
-dontwarn bchain.**
-dontwarn btc.**
-dontwarn common.**
-dontwarn utils.**

-keep class bchain.** { *;}
-keep class btc.** { *;}
-keep class common.** { *;}
-keep class utils.** { *;}

#web3j
-keep class org.web3j.** { *;}
-dontwarn org.web3j.**
#dapp
-keep class com.trustwallet.** { *;}
-dontwarn com.trustwallet.**
-keep class com.polkadot.bt.module.wallet_connect.** { *;}
-dontwarn com.polkadot.bt.module.wallet_connect.**
-keep class wallet.core.** { *;}
-dontwarn wallet.core.**

#Loading
 -keep class com.wang.avi.** { *;}
 -dontwarn  com.wang.avi.**
