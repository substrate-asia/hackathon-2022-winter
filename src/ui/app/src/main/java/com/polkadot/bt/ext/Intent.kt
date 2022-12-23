package com.polkadot.bt.ext

import android.content.Intent
import android.graphics.Bitmap
import android.net.Uri
import androidx.activity.ComponentActivity
import androidx.activity.result.ActivityResult
import androidx.activity.result.ActivityResultLauncher
import androidx.activity.result.IntentSenderRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.fragment.app.Fragment
import com.polkadot.bt.BuildConfig

/**
 * @author Heaven Created on 2022/6/23
 *
 */
/**
 * 使用 intent 启动其他组件
 *
 * @param activity : [ComponentActivity] 及其子类
 * @param intent : [Intent]
 * @param block : ([ActivityResult]) -> [Unit]
 *
 * @since androidx.activity:activity:1.3.0 [Deprecated]
 *
 * @return [ActivityResult]
 */
@Deprecated("androidx.activity:activity:1.3.0以后registerForActivityResult()方法需要在onResume()之前", ReplaceWith("intentForResult() { block(it) }", "${BuildConfig.APPLICATION_ID}.ext.intentForResult"))
inline fun intentForResult(activity: ComponentActivity, intent: Intent, crossinline block: (ActivityResult) -> Unit) {
    activity.registerForActivityResult(ActivityResultContracts.StartActivityForResult()) {
        block(it)
    }.launch(intent)
}

/**
 * 使用 intent 启动其他组件。
 * 需要在 [ComponentActivity] 及其子类中 或 使用 [ComponentActivity] 及其子类的上下文进行调用
 *
 * @param block : ([ActivityResult]) -> [Unit]
 *
 * @return [ActivityResult]
 */
inline fun ComponentActivity.intentForResult(crossinline block: (ActivityResult) -> Unit): ActivityResultLauncher<Intent> {
    return registerForActivityResult(ActivityResultContracts.StartActivityForResult()) {
        block(it)
    }
}

/**
 * 使用 intent 启动其他组件
 *
 * @param fragment : [ComponentActivity] 及其子类
 * @param intent : [Intent]
 * @param block : ([ActivityResult]) -> [Unit]
 *
 * @since androidx.fragment:fragment:1.3.0 [Deprecated]
 *
 * @return [ActivityResult]
 */
@Deprecated("androidx.fragment:fragment:1.3.0以后registerForActivityResult()方法需要在onResume()之前", ReplaceWith("intentForResult() { block(it) }", "${BuildConfig.APPLICATION_ID}.ext.intentForResult"))
inline fun intentForResult(fragment: Fragment, intent: Intent, crossinline block: (ActivityResult) -> Unit) {
    fragment.registerForActivityResult(ActivityResultContracts.StartActivityForResult()) {
        block(it)
    }.launch(intent)
}

/**
 * 使用 intent 启动其他组件
 * @param block : ([ActivityResult]) -> [Unit]
 *
 * @return [ActivityResult]
 */
inline fun Fragment.intentForResult(crossinline block: (ActivityResult) -> Unit): ActivityResultLauncher<Intent> {
    return registerForActivityResult(ActivityResultContracts.StartActivityForResult()) {
        block(it)
    }
}

/**
 * 通过 action 启动其他组件
 *
 * @return [ActivityResult]
 */
inline fun ComponentActivity.intentSenderForResult(crossinline block: (ActivityResult) -> Unit): ActivityResultLauncher<IntentSenderRequest> {
    return registerForActivityResult(ActivityResultContracts.StartIntentSenderForResult()) {
        block(it)
    }
}

/**
 * 通过 action 启动其他组件
 *
 * @return [ActivityResult]
 */
inline fun Fragment.intentSenderForResult(crossinline block: (ActivityResult) -> Unit): ActivityResultLauncher<IntentSenderRequest> {
    return registerForActivityResult(ActivityResultContracts.StartIntentSenderForResult()) {
        block(it)
    }
}

/**
 * 动态申请单个权限
 *
 * @return 是否同意该权限
 */
inline fun ComponentActivity.intentPermission(crossinline block: (Boolean) -> Unit): ActivityResultLauncher<String> {
    return registerForActivityResult(ActivityResultContracts.RequestPermission()) {
        block(it)
    }
}

/**
 * 动态申请单个权限
 *
 * @return 是否同意该权限
 */
inline fun Fragment.intentPermission(crossinline block: (Boolean) -> Unit): ActivityResultLauncher<String> {
    return registerForActivityResult(ActivityResultContracts.RequestPermission()) {
        block(it)
    }
}

/**
 * 动态申请多个权限 [RuntimePermission]
 *
 * @return 是否同意该组权限
 */
inline fun ComponentActivity.intentPermissions(crossinline block: (Map<String, Boolean>) -> Unit): ActivityResultLauncher<Array<String>> {
    return registerForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) {
        block(it)
    }
}

/**
 * 动态申请多个权限 [RuntimePermission]
 *
 * @return 是否同意该组权限
 */
inline fun Fragment.intentPermissions(crossinline block: (Map<String, Boolean>) -> Unit): ActivityResultLauncher<Array<String>> {
    return registerForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) {
        block(it)
    }
}

/**
 * 调用相机拍照并返回图片 [Bitmap]
 *
 * @return 返回图片 [Bitmap]
 */
inline fun ComponentActivity.takePicturePreview(crossinline block: (Bitmap?) -> Unit): ActivityResultLauncher<Void?> {
    return registerForActivityResult(ActivityResultContracts.TakePicturePreview()) {
        block(it)
    }
}

/**
 * 调用相机拍照并返回图片 [Bitmap]
 *
 * @return 返回图片 [Bitmap]
 */
inline fun Fragment.takePicturePreview(crossinline block: (Bitmap?) -> Unit): ActivityResultLauncher<Void?> {
    return registerForActivityResult(ActivityResultContracts.TakePicturePreview()) {
        block(it)
    }
}

/**
 * 调用相机拍照
 *
 * @return 返回是否成功拍照并保存照片
 */
inline fun ComponentActivity.takePicture(crossinline block: (Boolean) -> Unit): ActivityResultLauncher<Uri> {
    return registerForActivityResult(ActivityResultContracts.TakePicture()) {
        block(it)
    }
}

/**
 * 调用相机拍照
 *
 * @return 返回是否成功拍照并保存照片
 */
inline fun Fragment.takePicture(crossinline block: (Boolean) -> Unit): ActivityResultLauncher<Uri> {
    return registerForActivityResult(ActivityResultContracts.TakePicture()) {
        block(it)
    }
}

/**
 * 调用相机拍视频
 *
 * @return 视频缩略图 [Bitmap]
 */
inline fun ComponentActivity.takeVideo(crossinline block: (Bitmap?) -> Unit): ActivityResultLauncher<Uri> {
    return registerForActivityResult(ActivityResultContracts.TakeVideo()) {
        block(it)
    }
}

/**
 * 调用相机拍视频
 *
 * @return 视频缩略图 [Bitmap]
 */
inline fun Fragment.takeVideo(crossinline block: (Bitmap?) -> Unit): ActivityResultLauncher<Uri> {
    return registerForActivityResult(ActivityResultContracts.TakeVideo()) {
        block(it)
    }
}

/**
 * 从通讯录APP获取联系人
 *
 * @return [Uri]
 */
inline fun ComponentActivity.pickContact(crossinline block: (Uri?) -> Unit): ActivityResultLauncher<Void?> {
    return registerForActivityResult(ActivityResultContracts.PickContact()) {
        block(it)
    }
}

/**
 * 从通讯录APP获取联系人
 *
 * @return [Uri]
 */
inline fun Fragment.pickContact(crossinline block: (Uri?) -> Unit): ActivityResultLauncher<Void?> {
    return registerForActivityResult(ActivityResultContracts.PickContact()) {
        block(it)
    }
}

/**
 * 选择一条内容
 *
 * @return [Uri]
 */
inline fun ComponentActivity.getContent(crossinline block: (Uri?) -> Unit): ActivityResultLauncher<String> {
    return registerForActivityResult(ActivityResultContracts.GetContent()) {
        block(it)
    }
}

/**
 * 选择一条内容
 *
 * @return [Uri]
 */
inline fun Fragment.getContent(crossinline block: (Uri?) -> Unit): ActivityResultLauncher<String> {
    return registerForActivityResult(ActivityResultContracts.GetContent()) {
        block(it)
    }
}

/**
 * 选择多条内容
 * @return [List]<[Uri]>
 */
inline fun ComponentActivity.getMultipleContents(crossinline block: (List<Uri>) -> Unit): ActivityResultLauncher<String> {
    return registerForActivityResult(ActivityResultContracts.GetMultipleContents()) {
        block(it)
    }
}

/**
 * 选择多条内容
 *
 * @return [List]<[Uri]>
 */
inline fun Fragment.getMultipleContents(crossinline block: (List<Uri>) -> Unit): ActivityResultLauncher<String> {
    return registerForActivityResult(ActivityResultContracts.GetMultipleContents()) {
        block(it)
    }
}

/**
 * 选择一个文档
 *
 * @return [Uri]
 */
inline fun ComponentActivity.openDocument(crossinline block: (Uri?) -> Unit): ActivityResultLauncher<Array<String>> {
    return registerForActivityResult(ActivityResultContracts.OpenDocument()) {
        block(it)
    }
}

/**
 * 选择一个文档
 *
 * @return [Uri]
 */
inline fun Fragment.openDocument(crossinline block: (Uri?) -> Unit): ActivityResultLauncher<Array< String>> {
    return registerForActivityResult(ActivityResultContracts.OpenDocument()) {
        block(it)
    }
}

/**
 * 选择一个、多个文档
 *
 * @return [List]<[Uri]>
 */
inline fun ComponentActivity.openMultipleDocuments(crossinline block: (List<Uri>) -> Unit): ActivityResultLauncher<Array<String>> {
    return registerForActivityResult(ActivityResultContracts.OpenMultipleDocuments()) {
        block(it)
    }
}

/**
 * 选择一个、多个文档
 *
 * @return [List]<[Uri]>
 */
inline fun Fragment.openMultipleDocuments(crossinline block: (List<Uri>) -> Unit): ActivityResultLauncher<Array<String>> {
    return registerForActivityResult(ActivityResultContracts.OpenMultipleDocuments()) {
        block(it)
    }
}

/**
 * 打开文档树选择文档
 *
 * @return [Uri]
 */
inline fun ComponentActivity.openDocumentTree(crossinline block: (Uri?) -> Unit): ActivityResultLauncher<Uri?> {
    return registerForActivityResult(ActivityResultContracts.OpenDocumentTree()) {
        block(it)
    }
}

/**
 * 打开文档树选择文档
 *
 * @return [Uri]
 */
inline fun Fragment.openDocumentTree(crossinline block: (Uri?) -> Unit): ActivityResultLauncher<Uri?> {
    return registerForActivityResult(ActivityResultContracts.OpenDocumentTree()) {
        block(it)
    }
}

/**
 * 传入路径，创建新文档
 *
 * @return [Uri]
 */
inline fun ComponentActivity.createDocument(crossinline block: (Uri?) -> Unit): ActivityResultLauncher<String> {
    return registerForActivityResult(ActivityResultContracts.CreateDocument()) {
        block(it)
    }
}

/**
 * 传入路径，创建新文档
 *
 * @return [Uri]
 */
inline fun Fragment.createDocument(crossinline block: (Uri?) -> Unit): ActivityResultLauncher<String> {
    return registerForActivityResult(ActivityResultContracts.CreateDocument()) {
        block(it)
    }
}

/**
 * 打开相册选择图片
 *
 * @return [Uri]
 */
inline fun ComponentActivity.selectPhoto(crossinline block: (Uri?) -> Unit): ActivityResultLauncher<Unit?> {
    return registerForActivityResult(SelectPhotoContract()) {
        block(it)
    }
}

/**
 * 打开相册选择图片
 *
 * @return [Uri]
 */
inline fun Fragment.selectPhoto(crossinline block: (Uri?) -> Unit): ActivityResultLauncher<Unit?> {
    return registerForActivityResult(SelectPhotoContract()) {
        block(it)
    }
}


/**
 * 拍照
 *
 * @return [Uri]
 */
inline fun ComponentActivity.takePhoto(crossinline block: (Uri?) -> Unit): ActivityResultLauncher<Unit?> {
    return registerForActivityResult(TakePhotoContract()) {
        block(it)
    }
}

/**
 * 拍照
 *
 * @return [Uri]
 */
inline fun Fragment.takePhoto(crossinline block: (Uri?) -> Unit): ActivityResultLauncher<Unit?> {
    return registerForActivityResult(TakePhotoContract()) {
        block(it)
    }
}

/**
 * 裁剪图片
 *
 * @return [Uri]
 */
inline fun ComponentActivity.cropPhoto(crossinline block: (CropPhotoContract.CropOutput?) -> Unit): ActivityResultLauncher<Uri?> {
    return registerForActivityResult(CropPhotoContract()) {
        block(it)
    }
}

/**
 * 裁剪图片
 *
 * @return [Uri]
 */
inline fun Fragment.cropPhoto(crossinline block: (CropPhotoContract.CropOutput?) -> Unit): ActivityResultLauncher<Uri?> {
    return registerForActivityResult(CropPhotoContract()) {
        block(it)
    }
}

