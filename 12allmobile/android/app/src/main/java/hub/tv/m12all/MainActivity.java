package hub.tv.m12all;

import android.content.Intent;
import android.content.res.Configuration;
import android.os.Bundle;
import android.webkit.WebView;

// import com.capacitorjs.plugins.storage.StoragePlugin;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.PluginHandle;
import com.getcapacitor.community.admob.AdMob;
import com.smartlook.sdk.smartlook.Smartlook;

import tv.m12all.pip.PipPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        registerPlugin(AdMob.class);
        // registerPlugin(StoragePlugin.class);
        Smartlook.unregisterBlacklistedClass(WebView.class);
        Smartlook.setupAndStartRecording("482cb5cb86894efd1b9e92cc47df2e74653fc6af");
    }

    @Override
    protected void onNewIntent(Intent intent) {
        this.setIntent(intent);
        super.onNewIntent(intent);
    }

    @Override
    public void onPictureInPictureModeChanged(boolean isInPictureInPictureMode, Configuration newConfig) {
        PluginHandle pipPlugin = bridge.getPlugin("Pip");
        if (pipPlugin != null) {
            PipPlugin pipPluginInstance = (PipPlugin) pipPlugin.getInstance();
            pipPluginInstance.onPictureAndPictureModeChange(isInPictureInPictureMode);
        }
    }
}
