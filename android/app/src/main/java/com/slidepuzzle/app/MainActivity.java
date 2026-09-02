package com.slidepuzzle.app;

import android.os.Bundle;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        WindowCompat.setDecorFitsSystemWindows(getWindow(), true);
        applyStatusBarStyle();
    }

    @Override
    public void onResume() {
        super.onResume();
        // Re-apply after Capacitor may have overridden it during bridge init.
        applyStatusBarStyle();
    }

    private void applyStatusBarStyle() {
        // false = NOT light appearance = white icons, visible on dark backgrounds.
        WindowInsetsControllerCompat controller =
            WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        controller.setAppearanceLightStatusBars(false);
    }
}
