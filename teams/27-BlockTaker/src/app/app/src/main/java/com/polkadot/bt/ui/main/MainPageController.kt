package com.polkadot.bt.ui.main

import android.util.SparseArray
import androidx.core.util.forEach
import androidx.fragment.app.Fragment
import androidx.fragment.app.FragmentManager
import com.google.android.material.bottomnavigation.BottomNavigationView
import com.polkadot.bt.R
import com.polkadot.bt.ui.stake.StakeFragment
import com.polkadot.bt.ui.dapp.DAppFragment
import com.polkadot.bt.ui.home.ValueFragment
import com.polkadot.bt.ui.mine.MineFragment

class MainPageController(private val fm: FragmentManager, private val containerId: Int) {

    private val fragments = SparseArray<Fragment>()
    private var selectedItemId = R.id.value


    fun init() {
        addFragment(ValueFragment(), R.id.value)
        //addFragment(ConvertFragment(), R.id.convert)
        addFragment(StakeFragment(), R.id.stake)
        addFragment(DAppFragment(), R.id.dapp)
        addFragment(MineFragment(), R.id.mine)


        fragments.forEach { id, fragment ->
            if (id != R.id.value) {
                fm.beginTransaction().hide(fragment).commit()
            }
        }
    }

    fun setupWithBottomNavigation(bn: BottomNavigationView) {
        bn.setOnItemSelectedListener {
            if (it.itemId != selectedItemId) {
                val targetFragment = fragments[it.itemId]
                if (targetFragment != null) {
                    fragments.forEach { id, fragment ->
                        if (id == it.itemId) {
                            fm.beginTransaction().show(fragment).commit()
                        } else {
                            fm.beginTransaction().hide(fragment).commit()
                        }
                    }
                    selectedItemId = it.itemId
                }
            }
            true
        }
    }

    private fun addFragment(fragment: Fragment, id: Int) {
        fragments.put(id, fragment)
        fm.beginTransaction().add(containerId, fragment).commit()
    }

}