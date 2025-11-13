/* =========================================================
   screens/galeria/DetalleBarberoGaleriaScreen.js
   PANTALLA DETALLE - Muestra todas las fotos y videos de un barbero ejemplo1
   ========================================================= */
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Modal,
  ActivityIndicator,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import Footer from "../../components/Footer";

const { width } = Dimensions.get("window");
const isMobile = width < 768;

const DetalleBarberoGaleriaScreen = ({ route, navigation }) => {
  const { barberoID } = route.params;
  const [barbero, setBarbero] = useState(null);
  const [galeria, setGaleria] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState("todos");

  const fetchGaleriaBarbero = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `https://vianney-server.onrender.com/galeria/public/barbero/${barberoID}`,
        {
          params: filtroTipo !== "todos" ? { tipo: filtroTipo } : {},
        }
      );

      if (response.data.success) {
        setBarbero(response.data.data.barbero);
        setGaleria(response.data.data.galeria || []);
      }
    } catch (error) {
      console.error("Error al cargar galería del barbero:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGaleriaBarbero();
  }, [filtroTipo]);

  const abrirDetalle = (item) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const cerrarDetalle = () => {
    setModalVisible(false);
    setSelectedItem(null);
  };

  const abrirTelefono = (telefono) => {
    Linking.openURL(`tel:${telefono}`);
  };

  const renderItem = (item) => {
    const esVideo = item.tipo === "video";
    const urlMostrar = esVideo && item.miniatura ? item.miniatura : item.url;

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.itemContainer}
        onPress={() => abrirDetalle(item)}
        activeOpacity={0.8}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: urlMostrar }}
            style={styles.image}
            resizeMode="cover"
          />
          {esVideo && (
            <View style={styles.videoOverlay}>
              <Ionicons name="play-circle" size={50} color="white" />
            </View>
          )}
          {item.esDestacada && (
            <View style={styles.destacadaBadge}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.destacadaTexto}>Destacada</Text>
            </View>
          )}
        </View>
        <View style={styles.itemInfo}>
          <Text style={styles.itemTitle} numberOfLines={2}>
            {item.titulo}
          </Text>
          {item.descripcion && (
            <Text style={styles.itemDescription} numberOfLines={2}>
              {item.descripcion}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#424242" />
        <Text style={styles.loadingText}>Cargando galería...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Header con info del barbero */}
        <View style={styles.headerContainer}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#424242" />
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <Image
              source={
                barbero?.avatar
                  ? { uri: barbero.avatar }
                  : require("../../assets/avatar.png")
              }
              style={styles.headerAvatar}
            />
            <View style={styles.headerTextos}>
              <Text style={styles.headerNombre}>{barbero?.nombre}</Text>
              <Text style={styles.headerEspecialidad}>
                Especialista en cortes clásicos
              </Text>
              <TouchableOpacity
                style={styles.headerTelefono}
                onPress={() => abrirTelefono(barbero?.telefono)}
              >
                <Ionicons name="call" size={16} color="#424242" />
                <Text style={styles.headerTelefonoTexto}>
                  {barbero?.telefono}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.headerRedes}>
            <TouchableOpacity style={styles.iconoRedHeader}>
              <Ionicons name="logo-instagram" size={20} color="#E4405F" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconoRedHeader}>
              <Ionicons name="logo-facebook" size={20} color="#1877F2" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconoRedHeader}>
              <Ionicons name="logo-tiktok" size={20} color="#000" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Horario */}
        <View style={styles.horarioBanner}>
          <Ionicons name="time-outline" size={20} color="#666" />
          <Text style={styles.horarioBannerTexto}>
            Lunes a Sábado: 9:00 - 19:00
          </Text>
        </View>

        {/* Filtros */}
        <View style={styles.filtrosContainer}>
          <TouchableOpacity
            style={[
              styles.filtroButton,
              filtroTipo === "todos" && styles.filtroButtonActive,
            ]}
            onPress={() => setFiltroTipo("todos")}
          >
            <Text
              style={[
                styles.filtroText,
                filtroTipo === "todos" && styles.filtroTextActive,
              ]}
            >
              Todos ({galeria.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filtroButton,
              filtroTipo === "imagen" && styles.filtroButtonActive,
            ]}
            onPress={() => setFiltroTipo("imagen")}
          >
            <Ionicons
              name="image-outline"
              size={18}
              color={filtroTipo === "imagen" ? "white" : "#424242"}
            />
            <Text
              style={[
                styles.filtroText,
                filtroTipo === "imagen" && styles.filtroTextActive,
              ]}
            >
              Fotos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filtroButton,
              filtroTipo === "video" && styles.filtroButtonActive,
            ]}
            onPress={() => setFiltroTipo("video")}
          >
            <Ionicons
              name="videocam-outline"
              size={18}
              color={filtroTipo === "video" ? "white" : "#424242"}
            />
            <Text
              style={[
                styles.filtroText,
                filtroTipo === "video" && styles.filtroTextActive,
              ]}
            >
              Videos
            </Text>
          </TouchableOpacity>
        </View>

        {/* Grid de trabajos */}
        {galeria.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="images-outline" size={80} color="#ccc" />
            <Text style={styles.emptyText}>
              Este barbero aún no tiene trabajos publicados
            </Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.gridContainer}
            showsVerticalScrollIndicator={false}
          >
            {galeria.map((item) => renderItem(item))}
          </ScrollView>
        )}
      </View>

      {/* Modal de detalle */}
      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent
        onRequestClose={cerrarDetalle}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeButton} onPress={cerrarDetalle}>
              <Ionicons name="close" size={30} color="white" />
            </TouchableOpacity>

            {selectedItem && (
              <ScrollView contentContainerStyle={styles.modalScroll}>
                {selectedItem.tipo === "imagen" ? (
                  <Image
                    source={{ uri: selectedItem.url }}
                    style={styles.modalImage}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={styles.videoPreview}>
                    <Image
                      source={{
                        uri: selectedItem.miniatura || selectedItem.url,
                      }}
                      style={styles.modalImage}
                      resizeMode="contain"
                    />
                    <View style={styles.videoOverlayLarge}>
                      <Ionicons name="play-circle" size={80} color="white" />
                      <Text style={styles.videoText}>
                        Video no reproducible en esta vista
                      </Text>
                    </View>
                  </View>
                )}

                <View style={styles.modalInfo}>
                  <Text style={styles.modalTitle}>{selectedItem.titulo}</Text>
                  {selectedItem.descripcion && (
                    <Text style={styles.modalDescription}>
                      {selectedItem.descripcion}
                    </Text>
                  )}
                  {selectedItem.etiquetas && (
                    <View style={styles.etiquetasContainer}>
                      {selectedItem.etiquetas.map((etiqueta, index) => (
                        <View key={index} style={styles.etiqueta}>
                          <Text style={styles.etiquetaText}>{etiqueta}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      <Footer />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
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
  headerContainer: {
    backgroundColor: "#f9f9f9",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    marginBottom: 12,
  },
  headerInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  headerAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#FFD700",
  },
  headerTextos: {
    flex: 1,
    marginLeft: 16,
  },
  headerNombre: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  headerEspecialidad: {
    fontSize: 14,
    color: "#FFD700",
    fontWeight: "500",
    marginBottom: 8,
  },
  headerTelefono: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  headerTelefonoTexto: {
    fontSize: 14,
    color: "#424242",
    fontWeight: "500",
  },
  headerRedes: {
    flexDirection: "row",
    gap: 12,
  },
  iconoRedHeader: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  horarioBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FFF9E6",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#FFD700",
  },
  horarioBannerTexto: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  filtrosContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 8,
    backgroundColor: "white",
  },
  filtroButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#424242",
    backgroundColor: "white",
    gap: 6,
  },
  filtroButtonActive: {
    backgroundColor: "#424242",
  },
  filtroText: {
    color: "#424242",
    fontSize: 14,
    fontWeight: "500",
  },
  filtroTextActive: {
    color: "white",
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
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    padding: 16,
    paddingBottom: 80,
  },
  itemContainer: {
    width: isMobile ? "48%" : "23%",
    marginBottom: 16,
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    width: "100%",
    height: isMobile ? 150 : 200,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  videoOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  destacadaBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  destacadaTexto: {
    color: "#FFD700",
    fontSize: 11,
    fontWeight: "600",
  },
  itemInfo: {
    padding: 12,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
    color: "#333",
  },
  itemDescription: {
    fontSize: 12,
    color: "#666",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    maxHeight: "90%",
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    overflow: "hidden",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 5,
  },
  modalScroll: {
    padding: 20,
  },
  modalImage: {
    width: "100%",
    height: 400,
  },
  videoPreview: {
    position: "relative",
  },
  videoOverlayLarge: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  videoText: {
    color: "white",
    marginTop: 10,
    fontSize: 14,
  },
  modalInfo: {
    marginTop: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
  },
  modalDescription: {
    fontSize: 14,
    color: "#ccc",
    lineHeight: 20,
  },
  etiquetasContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 16,
    gap: 8,
  },
  etiqueta: {
    backgroundColor: "#424242",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  etiquetaText: {
    color: "white",
    fontSize: 12,
  },
});

export default DetalleBarberoGaleriaScreen;