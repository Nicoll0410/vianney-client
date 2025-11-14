/* =========================================================
   screens/galeria/GaleriaBarberosScreen.js
   PANTALLA PRINCIPAL - Muestra tarjeta de cada barbero con 1 imagen
   ========================================================= */
import React, { useState, useEffect, useCallback, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Linking,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { AuthContext } from "../../contexts/AuthContext";
import Footer from "../../components/Footer";

const { width } = Dimensions.get("window");
const isMobile = width < 768;

const GaleriaBarberosScreen = ({ navigation }) => {
  const { userRole } = useContext(AuthContext);
  const [barberos, setBarberos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBarberosConGaleria = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "https://vianney-server.onrender.com/galeria/public/barberos"
      );

      if (response.data.success) {
        setBarberos(response.data.data || []);
      }
    } catch (error) {
      console.error("Error al cargar barberos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBarberosConGaleria();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchBarberosConGaleria();
    }, [])
  );

  const abrirTelefono = (telefono) => {
    Linking.openURL(`tel:${telefono}`);
  };

  const verMasTrabajos = (barberoID) => {
    navigation.navigate("DetalleBarberoGaleria", { barberoID });
  };

  const irAGestion = () => {
    navigation.navigate("GestionGaleria");
  };

  const renderBarberoCard = (item) => {
    const { barbero, imagenPrincipal, totalItems } = item;

    return (
      <View key={barbero.id} style={styles.card}>
        {/* Imagen destacada del trabajo */}
        <View style={styles.imagenTrabajoContainer}>
          {imagenPrincipal ? (
            <Image
              source={{ uri: imagenPrincipal.url }}
              style={styles.imagenTrabajo}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.imagenTrabajo, styles.sinImagen]}>
              <Ionicons name="images-outline" size={50} color="#ccc" />
              <Text style={styles.sinImagenTexto}>Sin trabajos</Text>
            </View>
          )}
          
          {/* Badge con cantidad de trabajos */}
          <View style={styles.badgeCantidad}>
            <Ionicons name="images" size={16} color="white" />
            <Text style={styles.badgeCantidadTexto}>{totalItems}</Text>
          </View>
        </View>

        {/* Información del barbero */}
        <View style={styles.infoBarbero}>
          {/* Avatar y nombre */}
          <View style={styles.headerBarbero}>
            <Image
              source={
                barbero.avatar
                  ? { uri: barbero.avatar }
                  : require("../../assets/avatar.png")
              }
              style={styles.avatar}
              resizeMode="cover"
            />
            <View style={styles.nombreContainer}>
              <Text style={styles.nombreBarbero}>{barbero.nombre}</Text>
              <Text style={styles.especialidad}>Especialista en cortes clásicos</Text>
            </View>
          </View>

          {/* Contacto */}
          <View style={styles.contactoContainer}>
            <TouchableOpacity
              style={styles.botonContacto}
              onPress={() => abrirTelefono(barbero.telefono)}
            >
              <Ionicons name="call" size={18} color="#424242" />
              <Text style={styles.telefonoTexto}>{barbero.telefono}</Text>
            </TouchableOpacity>
          </View>

          {/* Redes sociales (placeholder - puedes agregar estos campos al modelo) */}
          <View style={styles.redesContainer}>
            <TouchableOpacity style={styles.iconoRed}>
              <Ionicons name="logo-instagram" size={24} color="#E4405F" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconoRed}>
              <Ionicons name="logo-facebook" size={24} color="#1877F2" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconoRed}>
              <Ionicons name="logo-tiktok" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          {/* Horario (placeholder) */}
          <View style={styles.horarioContainer}>
            <Ionicons name="time-outline" size={18} color="#666" />
            <Text style={styles.horarioTexto}>Lunes a Sábado: 9:00 - 19:00</Text>
          </View>

          {/* Botón Ver más */}
          <TouchableOpacity
            style={styles.botonVerMas}
            onPress={() => verMasTrabajos(barbero.id)}
            activeOpacity={0.8}
          >
            <Text style={styles.botonVerMasTexto}>Ver más trabajos</Text>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.tituloContainer}>
            <Text style={styles.titulo}>Galería - Barbería Elite</Text>
            <View style={styles.contadorContainer}>
              <Text style={styles.contadorTexto}>{barberos.length}</Text>
            </View>
          </View>

          {/* Botón de gestión para Admin y Barberos */}
          {(userRole === "Administrador" || userRole === "Barbero") && (
            <TouchableOpacity
              style={styles.botonHeader}
              onPress={irAGestion}
              activeOpacity={0.7}
            >
              <Ionicons name="settings-outline" size={20} color="white" />
              <Text style={styles.textoBoton}>Gestionar</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Contenido */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#424242" />
            <Text style={styles.loadingText}>Cargando galería...</Text>
          </View>
        ) : barberos.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="cut-outline" size={80} color="#ccc" />
            <Text style={styles.emptyText}>
              Aún no hay trabajos en la galería
            </Text>
            {(userRole === "Administrador" || userRole === "Barbero") && (
              <TouchableOpacity style={styles.emptyButton} onPress={irAGestion}>
                <Text style={styles.emptyButtonText}>Agregar contenido</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.gridContainer}
            showsVerticalScrollIndicator={false}
          >
            {barberos.map((item) => renderBarberoCard(item))}
          </ScrollView>
        )}
      </View>

      <Footer />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  tituloContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    marginRight: 10,
    color: "#333",
  },
  contadorContainer: {
    backgroundColor: "#FFD700",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  contadorTexto: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#333",
  },
  botonHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#424242",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  textoBoton: {
    marginLeft: 8,
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginTop: 16,
    textAlign: "center",
  },
  emptyButton: {
    marginTop: 20,
    backgroundColor: "#424242",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: "white",
    fontWeight: "600",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingBottom: 20,
  },
  card: {
    width: isMobile ? "100%" : "48%",
    backgroundColor: "white",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  imagenTrabajoContainer: {
    width: "100%",
    height: 250,
    position: "relative",
    backgroundColor: "#f0f0f0",
  },
  imagenTrabajo: {
    width: "100%",
    height: "100%",
  },
  sinImagen: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e0e0e0",
  },
  sinImagenTexto: {
    marginTop: 8,
    color: "#999",
    fontSize: 14,
  },
  badgeCantidad: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  badgeCantidadTexto: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  infoBarbero: {
    padding: 16,
  },
  headerBarbero: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: "#FFD700",
  },
  nombreContainer: {
    flex: 1,
    marginLeft: 12,
  },
  nombreBarbero: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  especialidad: {
    fontSize: 14,
    color: "#FFD700",
    fontWeight: "500",
  },
  contactoContainer: {
    marginBottom: 12,
  },
  botonContacto: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    gap: 8,
  },
  telefonoTexto: {
    fontSize: 15,
    color: "#424242",
    fontWeight: "500",
  },
  redesContainer: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 12,
  },
  iconoRed: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  horarioContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
  },
  horarioTexto: {
    fontSize: 13,
    color: "#666",
  },
  botonVerMas: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#424242",
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
  },
  botonVerMasTexto: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default GaleriaBarberosScreen;