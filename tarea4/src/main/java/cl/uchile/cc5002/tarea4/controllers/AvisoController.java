package cl.uchile.cc5002.tarea4.controllers;

import cl.uchile.cc5002.tarea4.dto.NotaRequest;
import cl.uchile.cc5002.tarea4.models.AvisoAdopcion;
import cl.uchile.cc5002.tarea4.models.Nota;
import cl.uchile.cc5002.tarea4.models.Region;
import cl.uchile.cc5002.tarea4.repositories.AvisoAdopcionRepository;
import cl.uchile.cc5002.tarea4.repositories.NotaRepository;
import cl.uchile.cc5002.tarea4.repositories.RegionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List; 
import java.util.Map;

@Controller
public class AvisoController {

    @Autowired
    private AvisoAdopcionRepository avisoAdopcionRepository;
    @Autowired
    private NotaRepository notaRepository;
    @Autowired 
    private RegionRepository regionRepository;

    // --- Ruta para la portada index ---
    @GetMapping("/")
    public String mostrarIndex(Model model) {
        Pageable ultimosCinco = PageRequest.of(0, 5, Sort.by("fechaIngreso").descending());
        Page<AvisoAdopcion> avisos = avisoAdopcionRepository.findAll(ultimosCinco);
        model.addAttribute("avisos", avisos.getContent());
        return "index"; // a index.html
    }

    // --- Ruta para mostrar el formulario de agregar aviso ---
    @GetMapping("/agregar")
    public String mostrarFormularioAgregar(Model model) {
        List<Region> regiones = regionRepository.findAllByOrderByIdAsc();
        model.addAttribute("regiones", regiones);
        return "agregar-aviso"; // a agregar-aviso.html
    }

    // --- Ruta para el listado  ---
    @GetMapping("/listado")
    public String mostrarListado(
            @RequestParam(name = "pagina", defaultValue = "0") int pagina,
            Model model) {
        Pageable pageable = PageRequest.of(pagina, 5, Sort.by("fechaIngreso").descending());
        Page<AvisoAdopcion> avisosPaginados = avisoAdopcionRepository.findAll(pageable);
        model.addAttribute("pagination", avisosPaginados);
        return "listado-adopciones";
    }

    // --- Ruta para estadísticos ---
    @GetMapping("/estadisticas")
    public String mostrarEstadisticas() {
        return "estadisticas"; // a estadisticas.html
    }

    // --- API para evaluar ---
    @PostMapping("/api/avisos/{id}/evaluar")
    @ResponseBody
    public ResponseEntity<?> evaluarAviso(@PathVariable("id") Integer avisoId, @RequestBody NotaRequest notaRequest) {
        AvisoAdopcion aviso = avisoAdopcionRepository.findById(avisoId)
                .orElse(null);

        if (aviso == null) {
            return ResponseEntity.notFound().build();
        }

        // --- VALIDACIÓN ---
        Double notaValor = notaRequest.getNota();

        // Verifica si es nulo, si tiene decimales. o si está fuera de rango.
        if (notaValor == null || notaValor % 1 != 0 || notaValor < 1 || notaValor > 7) {
            return ResponseEntity.badRequest().body(Map.of("error", "La nota debe ser un número entero entre 1 y 7."));
        }
        
        // Si la validación pasa se convierte en entero para guardarlo.
        int notaEntera = notaValor.intValue();

        Nota nuevaNota = new Nota();
        nuevaNota.setNota(notaEntera); // Guardamos el entero
        nuevaNota.setAviso(aviso);
        notaRepository.save(nuevaNota);

        AvisoAdopcion avisoActualizado = avisoAdopcionRepository.findById(avisoId).get();
        Double nuevoPromedio = avisoActualizado.getNotaPromedio();

        return ResponseEntity.ok(Map.of("nuevoPromedio", nuevoPromedio));
    }
}
