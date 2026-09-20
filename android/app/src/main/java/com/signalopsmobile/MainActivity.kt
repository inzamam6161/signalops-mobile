package com.signalopsmobile

import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.swmansion.rnscreens.fragment.restoration.RNScreensFragmentFactory

class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript.
   */
  override fun getMainComponentName(): String = "SignalOpsMobile"

  /**
   * Uses React Native's default activity delegate with New Architecture support.
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
    DefaultReactActivityDelegate(
      this,
      mainComponentName,
      fabricEnabled,
    )

  override fun onCreate(savedInstanceState: Bundle?) {
    supportFragmentManager.fragmentFactory =
      RNScreensFragmentFactory()

    super.onCreate(savedInstanceState)
  }
}
