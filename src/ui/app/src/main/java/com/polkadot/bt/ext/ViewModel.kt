package com.polkadot.bt.ext

import androidx.lifecycle.*

/**
 * @author Heaven
 * @date 2022/8/3 17:15
 */
val owners = HashMap<String, VMStoreOwner>()

inline fun <reified VM : ViewModel> LifecycleOwner.viewModel(
    scopeName: String = "ViewModel"
) = obtainViewModel<VM>(scopeName).value

inline fun <reified VM : ViewModel> LifecycleOwner.viewModel(
    scopeName: String = "ViewModel",
    factory: ViewModelProvider.Factory = ViewModelProvider.NewInstanceFactory()
) = obtainViewModel<VM>(scopeName, factory).value

inline fun <reified VM : ViewModel> LifecycleOwner.obtainViewModel(
    scopeName: String = "ViewModel",
    factory: ViewModelProvider.Factory = ViewModelProvider.NewInstanceFactory()
): Lazy<VM> {
    val owner = if (owners.containsKey(scopeName)) {
        owners[scopeName] ?: obtainVMStore(scopeName)
    } else {
        obtainVMStore(scopeName)
    }
    owner.register(this)
    return ViewModelLazy(VM::class, { owner.viewModelStore }, { factory })
}

fun obtainVMStore(scopeName: String): VMStoreOwner {
    val owner = VMStoreOwner()
    owners[scopeName] = owner
    return owner
}

class VMStoreOwner : ViewModelStoreOwner {

    private val bindTargets = mutableListOf<LifecycleOwner>()
    private lateinit var vmStore: ViewModelStore

    fun register(host: LifecycleOwner) {
        if (!bindTargets.contains(host)) {
            bindTargets.add(host)
            host.lifecycle.addObserver { observer, _, event ->
                if (event == Lifecycle.Event.ON_DESTROY) {
                    host.lifecycle.removeObserver(observer)
                    bindTargets.remove(host)
                    if (bindTargets.isEmpty()) {
                        owners.entries.find {
                            it.value == this@VMStoreOwner
                        }?.also {
                            viewModelStore.clear()
                            owners.remove(it.key)
                        }
                    }
                }
            }
        }
    }

    override fun getViewModelStore(): ViewModelStore {
        if (!this::vmStore.isInitialized) {
            vmStore = ViewModelStore()
        }
        return vmStore
    }
}
