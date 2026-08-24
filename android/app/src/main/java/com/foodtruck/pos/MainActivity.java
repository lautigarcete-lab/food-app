package com.foodtruck.pos;

import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.webkit.WebView;

import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.getcapacitor.BridgeActivity;

/**
 * Pantalla completa de verdad: la app se dibuja por debajo de la barra de
 * estado y de los botones de navegación, con las dos transparentes, en vez
 * de quedar encajonada entre dos franjas del sistema.
 *
 * Android no le avisa a la web cuánto ocupan esas barras: env(safe-area-inset-*)
 * en el WebView solo cubre el recorte de la cámara, no los botones. Así que
 * acá se leen los márgenes reales y se le pasan a la página como variables
 * CSS (--inset-top, --inset-bottom, …), que es lo que usa la hoja de estilos
 * para dejar el menú flotante y el panel de cobro por encima de los botones.
 */
public class MainActivity extends BridgeActivity {

    private Insets ultimosMargenes = Insets.NONE;
    private int altoTeclado = 0;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Que el contenido ocupe toda la pantalla, barras incluidas.
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        getWindow().setStatusBarColor(Color.TRANSPARENT);
        getWindow().setNavigationBarColor(Color.TRANSPARENT);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            // Sin esto Android pinta un velo gris detrás de los botones.
            getWindow().setNavigationBarContrastEnforced(false);
        }

        // El fondo de la app es claro, así que los íconos del sistema van
        // oscuros para que se vean.
        View raiz = getWindow().getDecorView();
        WindowInsetsControllerCompat controlador =
                WindowCompat.getInsetsController(getWindow(), raiz);
        controlador.setAppearanceLightStatusBars(true);
        controlador.setAppearanceLightNavigationBars(true);

        final WebView webView = getBridge().getWebView();
        ViewCompat.setOnApplyWindowInsetsListener(raiz, (v, insets) -> {
            ultimosMargenes = insets.getInsets(
                    WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout());

            // A pantalla completa el sistema ya no achica la ventana cuando
            // sale el teclado, así que se achica el WebView a mano: si no, el
            // campo que estás escribiendo queda tapado.
            altoTeclado = insets.getInsets(WindowInsetsCompat.Type.ime()).bottom;
            if (webView != null) {
                webView.setPadding(0, 0, 0, altoTeclado);
            }

            pasarMargenesALaWeb(webView);
            return insets;
        });

        // La página puede terminar de cargar después de que llegaron los
        // márgenes, así que se vuelven a mandar cuando el WebView avisa que
        // cambió de tamaño (que pasa al montar y al girar el celular).
        webView.addOnLayoutChangeListener(
                (v, l, t, r, b, ol, ot, or_, ob) -> pasarMargenesALaWeb(webView));
    }

    @Override
    public void onResume() {
        super.onResume();
        getWindow().getDecorView().requestApplyInsets();
    }

    private void pasarMargenesALaWeb(WebView webView) {
        if (webView == null) return;
        float densidad = getResources().getDisplayMetrics().density;
        // Los márgenes vienen en píxeles físicos y la web trabaja en px CSS.
        // Con el teclado abierto el WebView ya se achicó hasta arriba de él:
        // abajo no queda nada del sistema que esquivar.
        float margenAbajo = altoTeclado > 0 ? 0f : ultimosMargenes.bottom / densidad;
        String js = String.format(
                java.util.Locale.US,
                "(function(){var s=document.documentElement.style;"
                        + "s.setProperty('--inset-top','%.0fpx');"
                        + "s.setProperty('--inset-right','%.0fpx');"
                        + "s.setProperty('--inset-bottom','%.0fpx');"
                        + "s.setProperty('--inset-left','%.0fpx');})();",
                ultimosMargenes.top / densidad,
                ultimosMargenes.right / densidad,
                margenAbajo,
                ultimosMargenes.left / densidad);
        webView.evaluateJavascript(js, null);
    }
}
