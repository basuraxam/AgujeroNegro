/////////////////////////////////////////////////////////////////////////
// Agujero Negro para GNOME 3 - Versión Alpha 1.0 - <<SyKeY-XAM>> 
// Canal Youtube: https://www.youtube.com/sykeyxam
/////////////////////////////////////////////////////////////////////////
// NOTAS:
// Destino   : /home/usuario/.local/share/gnome-shell/extensions/AgujeroNegro@sykey.xam
// Extension : gnome-shell-extension-prefs
// Reiniciar : ALT + F2 luego escribir "r"
// Configurar:  
//		1. Descargar de GitHub con la opción CLONAR
//		2. Copiar carpeta AgujeroNegro@sykey.xam (no es un correo) a la carpeta Destino (indicado arriba)
//		3. Modificar parametro "TiempoEspera" (es una constante de este fichero) segun interese.
//		4. Activar extensión. 
//		5. En mi canal hay un vídeo visual de como configurarlo.

// MEJORAS:
// OK - Dock, 		Falta ajustar el tragador según la posición del dock
// OK - Ventanas,    	Tratar con + de una ventana abierta
// NO - Configurar,     Crear opción para configurar
// NO - Estándar, 	Probar en gnome estándar
// NO - Iconos, 	Oculto los iconos al no poder moverlos correctamente.
// NO - dock bloq,	Si el dock esta bloqueado no funciona por lo tanto lo oculto.
// gsettings set org.gnome.shell.extensions.dash-to-dock dock-fixed false


const TiempoEspera  = 20; // Tiempo de espera definido
const TEMinimo      = 30; // Mínimo 30 segundo para activarse si es inferior se activa con botón, si es superior por tiempo


const St = imports.gi.St;
const Main = imports.ui.main;
const Tweener = imports.ui.tweener;
const Gio = imports.gi.Gio; //Cambio de fondo de pantalla
//const glib = imports.gi.GLib; //home del usuario 
const ExtensionUtils = imports.misc.extensionUtils; //propiedades de la extensión



function doSetBackground(uri, schema) {
    let gsettings = new Gio.Settings({schema: schema});
    let prev = gsettings.get_string('picture-uri');
    uri = 'file://'+ uri;
    gsettings.set_string('picture-uri', uri);
    gsettings.set_string('picture-options', 'zoom');
    Gio.Settings.sync();
    gsettings.apply();
}


function IniciarTragarObj(){

  //Tiempo en hacer desaparecer los objetos
  const tiempoDock     	= 2;
  const tiempoPanel    	= 1;
  const tiempoVentanas 	= 0.5;
  const tiempo 		= 0.3; //tiempo en desaparecer el resto de objetos por el agujero negro

  //Centro de la pantalla
  var largo = Main.uiGroup.width / 2; 
  var alto  = Main.uiGroup.height / 2;	

  var vTiempo = tiempo;

  //ICONOS LOS HAGO DESAPARECER 
  var tHijos = Main.uiGroup.get_children()[0].get_children()[0].get_n_children();
  var i = 0;
  var obj = null;
  while (i<tHijos){
    var obj = Main.uiGroup.get_children()[0].get_children()[0].get_children()[i];
    if (obj.toString().indexOf('StWidget') > -1){
      obj.visible = false;
    }
    i++;
  }
  //Cantidad de objetos
  tHijos = Main.uiGroup.get_n_children();
  obj = null; 
  i = 1;
  while (i<tHijos){
    vTiempo = tiempo; 
    obj = Main.uiGroup.get_children()[i];
    if (obj.name == "dashtodockContainer"){
      var DockFixed = imports.misc.extensionUtils.extensions['ubuntu-dock@ubuntu.com'].imports.extension.dockManager._settings.get_boolean('dock-fixed');
      if (DockFixed) { obj.visible = false; }
      vTiempo = tiempoDock;
    }

    if (obj.name == "panelBox"){
      vTiempo=tiempoPanel
    }

    //todos menos el ALT + F2 (para realizar el reset con la "r")
    if (obj.name != "modalDialogGroup") { 
	    Tweener.addTween(obj,
		              { scale_x:0, scale_y:0, x:largo, y:alto,
		                time: vTiempo,
		                transition: 'easeOutQuad'
			      }
			    );
    }

    i++;
  }

  // Hacer desaparecer las ventanas
  var nventanas = Main.uiGroup.get_children()[0].get_n_children(); 
  i = 1
  while (i < nventanas){    
    ventana = Main.uiGroup.get_children()[0].get_children()[i];

    Tweener.addTween(ventana,
                      { scale_x:0, scale_y:0, x:largo, y:alto,
                        time: tiempoVentanas,
                        transition: 'easeOutQuad'
		      }
		    );

    i++;	
  }
  
}

function IniciarAgujeroNegro() {

//////////////////// ESTABLECER FONDO DE PANTALLA ////////////////////////////
  doSetBackground(ExtensionUtils.getCurrentExtension().path+"/agujero-negro-en-el-espacio.jpg", 'org.gnome.desktop.background');
/////////////////////////////////////////////////////////////////////////////////


//////////////////////// EFECTO AGUJERO NEGRO ///////////////////////////
  Tweener.addTween({},{ 
                       delay: 1.5,                       
		       onComplete: IniciarTragarObj 
                     }
		);
///////////////////////////////////////////////////////////////////////


}

function init() {
    button = new St.Bin({ style_class: 'panel-button',
                          reactive: true,
                          can_focus: true,
                          x_fill: true,
                          y_fill: false,
                          track_hover: true });
    let icon = new St.Icon({ icon_name: 'system-run-symbolic',
                             style_class: 'system-status-icon' });

    button.set_child(icon);
    button.connect('button-press-event', IniciarAgujeroNegro);
}

function enable() {
   if (TiempoEspera < TEMinimo){
     Main.panel._rightBox.insert_child_at_index(button, 0);
   }else{
     Tweener.addTween({},{ 
	               	   delay: TiempoEspera,                       
		           onComplete: IniciarAgujeroNegro 
	                 }
		     );
     
   }
}

function disable() {
   if (TiempoEspera < TEMinimo){               
     Main.panel._rightBox.remove_child(button);
   }
}
