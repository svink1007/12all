package hub.tv.m12all;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

public class CustomBroadcastReceiver extends BroadcastReceiver {
  @Override
  public void onReceive(Context context, Intent intent) {
    Log.d("receivermessage", "message");
    String action = intent.getAction();
    Log.d("receivermessage", String.format("Received intent with action %s", action));

    if (intent.getStringExtra("message") != null) {
      Log.d("receivermessage", intent.getStringExtra("message"));
    }

    if (intent.getStringExtra("title") != null) {
      Log.d("receivermessage", intent.getStringExtra("title"));
    }

    if (intent.getStringExtra("description") != null) {
      Log.d("receivermessage", intent.getStringExtra("description"));
    }

    if (intent.getStringExtra("data") != null) {
      Log.d("receivermessage", intent.getStringExtra("data"));
    }

//    abortBroadcast();
  }
}
