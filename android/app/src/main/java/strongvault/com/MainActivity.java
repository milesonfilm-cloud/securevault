package strongvault.com;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import androidx.core.splashscreen.SplashScreen;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    SplashScreen.installSplashScreen(this);
    super.onCreate(savedInstanceState);
  }

  @Override
  public void onStart() {
    super.onStart();
    allowUnmutedAutoplay();
  }

  @Override
  public void onResume() {
    super.onResume();
    allowUnmutedAutoplay();
  }

  /** First-launch logo clip must autoplay with audio (no tap). */
  private void allowUnmutedAutoplay() {
    if (getBridge() == null) return;
    WebView webView = getBridge().getWebView();
    if (webView == null) return;
    WebSettings settings = webView.getSettings();
    settings.setMediaPlaybackRequiresUserGesture(false);
    settings.setJavaScriptEnabled(true);
  }
}
