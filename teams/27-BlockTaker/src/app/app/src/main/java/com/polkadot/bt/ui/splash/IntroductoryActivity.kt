package com.polkadot.bt.ui.splash

import android.annotation.SuppressLint
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.lifecycle.lifecycleScope
import androidx.viewpager.widget.PagerAdapter
import androidx.viewpager.widget.ViewPager
import com.polkadot.bt.R
import com.polkadot.bt.databinding.ActivityIntroductoryBinding
import com.polkadot.bt.ext.click
import com.polkadot.bt.room.ValueDatabaseNew
import com.polkadot.bt.ui.BaseVBActivity
import com.polkadot.bt.ui.init.InitActivity
import com.polkadot.bt.ui.main.MainActivity
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import splitties.activities.start

class IntroductoryActivity: BaseVBActivity<ActivityIntroductoryBinding>() {

    override fun initBinding() = ActivityIntroductoryBinding.inflate(layoutInflater)
    private val listView= arrayListOf<View>()

    override fun init() {
        listView.add(LayoutInflater.from(this).inflate(R.layout.introductory_a,null))
        listView.add(LayoutInflater.from(this).inflate(R.layout.introductory_b,null))
        listView.add(LayoutInflater.from(this).inflate(R.layout.introductory_c,null))
        listView.add(LayoutInflater.from(this).inflate(R.layout.introductory_d,null))
        val adapter=IntroductoryAdapter()
        binding.viewpager.adapter=adapter
        binding.viewpager.currentItem=0
        binding.viewpager.addOnPageChangeListener(object:ViewPager.OnPageChangeListener{
            @SuppressLint("MissingSuperCall")
            override fun onPageScrolled(
                position: Int,
                positionOffset: Float,
                positionOffsetPixels: Int
            ) {
            }
            override fun onPageSelected(position: Int) {
//                if (position==3)binding.tvStart.visible() else binding.tvStart.gone()
                when(position){
                  0->{
                      binding.image1.background=getDrawable(R.drawable.circle_black_ring)
                      binding.image2.background=getDrawable(R.drawable.circle_grey)
                      binding.image3.background=getDrawable(R.drawable.circle_grey)
                      binding.image4.background=getDrawable(R.drawable.circle_grey)
                  }
                  1->{
                      binding.image1.background=getDrawable(R.drawable.circle_black_ring)
                      binding.image2.background=getDrawable(R.drawable.circle_black_ring)
                      binding.image3.background=getDrawable(R.drawable.circle_grey)
                      binding.image4.background=getDrawable(R.drawable.circle_grey)
                  }
                  2->{
                      binding.image1.background=getDrawable(R.drawable.circle_black_ring)
                      binding.image2.background=getDrawable(R.drawable.circle_black_ring)
                      binding.image3.background=getDrawable(R.drawable.circle_black_ring)
                      binding.image4.background=getDrawable(R.drawable.circle_grey)
                  }
                  3->{
                      binding.image1.background=getDrawable(R.drawable.circle_black_ring)
                      binding.image2.background=getDrawable(R.drawable.circle_black_ring)
                      binding.image3.background=getDrawable(R.drawable.circle_black_ring)
                      binding.image4.background=getDrawable(R.drawable.circle_black_ring)
                  }
                }
            }

            override fun onPageScrollStateChanged(state: Int) {
            }

        })
        click(binding.tvStart){
            start()
        }

    }
    private fun start() {
        lifecycleScope.launch {
            if (ValueDatabaseNew.get(this@IntroductoryActivity).getAllValue().isEmpty()){
                start<InitActivity>()
            }
            else{
                delay(1000)
                start<MainActivity>()
            }
            finish()
        }
    }

    inner class IntroductoryAdapter: PagerAdapter() {
        override fun getCount(): Int {
          return listView.size
        }

        override fun isViewFromObject(view: View, `object`: Any): Boolean {
            return view==`object`
        }

        override fun instantiateItem(container: ViewGroup, position: Int): Any {
            val view= listView[position]
            container.addView(view)
            return view
        }

        override fun destroyItem(container: ViewGroup, position: Int, `object`: Any) {
            container.removeView(listView[position])
        }

    }

}
