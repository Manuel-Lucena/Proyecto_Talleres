// package com.mlg.taller.security.config;


// import org.springframework.boot.CommandLineRunner;
// import org.springframework.security.crypto.password.PasswordEncoder;
// import org.springframework.stereotype.Component;

// import com.mlg.taller.model.entities.Rol;
// import com.mlg.taller.model.entities.Usuario;
// import com.mlg.taller.repositories.RolRepository;
// import com.mlg.taller.repositories.UsuarioRepository;

// import java.util.List;

// @Component
// public class DataInitializer implements CommandLineRunner {

//     private final RolRepository rolRepository;
//     private final UsuarioRepository usuarioRepository;
//     private final PasswordEncoder passwordEncoder;

//     public DataInitializer(RolRepository rolRepository, 
//                            UsuarioRepository usuarioRepository, 
//                            PasswordEncoder passwordEncoder) {
//         this.rolRepository = rolRepository;
//         this.usuarioRepository = usuarioRepository;
//         this.passwordEncoder = passwordEncoder;
//     }

//     @Override
//     public void run(String... args) throws Exception {
//         // 1. Crear Roles si la tabla está vacía
//         if (rolRepository.count() == 0) {
//             Rol adminRol = new Rol();
//             adminRol.setNombre("ADMIN");
            
//             Rol profeRol = new Rol();
//             profeRol.setNombre("PROFESOR");
            
//             Rol alumnoRol = new Rol();
//             alumnoRol.setNombre("ALUMNO");

//             rolRepository.saveAll(List.of(adminRol, profeRol, alumnoRol));
//             System.out.println(">> Roles iniciales creados.");
//         }

//         // 2. Crear Administrador inicial si no existe
//         if (usuarioRepository.findByEmail("admin@talleres.com").isEmpty()) {
//             Usuario admin = new Usuario();
//             admin.setNombre("Admin");
//             admin.setApellidos("Sistema");
//             admin.setDni("00000000A");
//             admin.setEmail("admin@talleres.com");
//             // Pon la contraseña que quieras, aquí 'admin123'
//             admin.setPassword(passwordEncoder.encode("admin123")); 
//             admin.setActivo(true);
            
    
//             rolRepository.findByNombre("ADMIN").ifPresent(admin::setRol);
            
//             usuarioRepository.save(admin);
//             System.out.println(">> Usuario administrador creado por defecto.");
//         }
//     }
// }