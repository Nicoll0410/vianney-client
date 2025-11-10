/* =========================================================
   screens/galeria/GaleriaScreen.js
   CON REPRODUCCIÓN DE VIDEOS
   ========================================================= */
import React, { useState, useEffect, useCallback, useContext, useRef } from "react";
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
  Platform,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Video } from 'expo-av';  // ← IMPORTANTE: Agregar esto
import { AuthContext } from "../../contexts/AuthContext";
import Footer from "../../components/Footer";

const { width } = Dimensions.get("window");
const isMobile = width < 768;

const GaleriaScreen = ({ navigation }) => {
  const { userRole } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const videoRef = useRef(null);  // ← Para controlar el video

  const fetchGaleria = async () => {
    try {
      setLoading(true);
      
      const endpoint =
        userRole === "Cliente"
          ? "https://vianney-server.onrender.com/galeria/public"
          : "https://vianney-server.onrender.com/galeria";

      const token = await AsyncStorage.getItem("token");
      
      const params = {};
      if (filtroTipo !== "todos") {
        params.tipo = filtroTipo;
      }

      const response = await axios.get(endpoint, {
        headers: userRole !== "Cliente" ? { Authorization: `Bearer ${token}` } : {},
        params,
      });

      if (response.data.success) {
        setItems(response.data.data || []);
      }
    } catch (error) {
      console.error("Error al cargar galería:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGaleria();
  }, [filtroTipo]);

  useFocusEffect(
    useCallback(() => {
      fetchGaleria();
    }, [filtroTipo])
  );

  const abrirDetalle = (item) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const cerrarDetalle = () => {
    // Pausar el video al cerrar
    if (videoRef.current) {
      videoRef.current.pauseAsync();
    }
    setModalVisible(false);
    setSelectedItem(null);
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

  const renderFiltros = () => (
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
          Todos
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
  );

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.tituloContainer}>
            <Text style={styles.titulo}>Galería</Text>
            <View style={styles.contadorContainer}>
              <Text style={styles.contadorTexto}>{items.length}</Text>
            </View>
          </View>

          {(userRole === "Administrador" || userRole === "Barbero") && (
            <TouchableOpacity
              style={styles.botonGestion}
              onPress={() => navigation.navigate("GestionGaleria")}
              activeOpacity={0.7}
            >
              <Ionicons name="settings-outline" size={20} color="white" />
              <Text style={styles.textoBoton}>Gestionar</Text>
            </TouchableOpacity>
          )}
        </View>

        {renderFiltros()}

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#424242" />
            <Text style={styles.loadingText}>Cargando galería...</Text>
          </View>
        ) : items.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="images-outline" size={80} color="#ccc" />
            <Text style={styles.emptyText}>No hay elementos en la galería</Text>
            {(userRole === "Administrador" || userRole === "Barbero") && (
              <TouchableOpacity 
                style={styles.emptyButton} 
                onPress={() => navigation.navigate("GestionGaleria")}
              >
                <Text style={styles.emptyButtonText}>Agregar contenido</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.gridContainer}
            showsVerticalScrollIndicator={false}
          >
            {items.map((item) => renderItem(item))}
          </ScrollView>
        )}
      </View>

      {/* Modal de detalle CON VIDEO */}
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
                  // ✅ REPRODUCTOR DE VIDEO REAL
                  <View style={styles.videoContainer}>
                    <Video
                      ref={videoRef}
                      source={{ uri: selectedItem.url }}
                      style={styles.video}
                      useNativeControls
                      resizeMode="contain"
                      shouldPlay={false}
                      onError={(error) => {
                        console.error("Error al reproducir video:", error);
                      }}
                    />
                  </View>
                )}

                <View style={styles.modalInfo}>
                  <Text style={styles.modalTitle}>{selectedItem.titulo}</Text>
                  {selectedItem.descripcion && (
                    <Text style={styles.modalDescription}>
                      {selectedItem.descripcion}
                    </Text>
                  )}
                  {selectedItem.etiquetas && Array.isArray(selectedItem.etiquetas) && (
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
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  tituloContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  titulo: {
    fontSize: 22,
    fontWeight: "bold",
    marginRight: 10,
  },
  contadorContainer: {
    backgroundColor: "#D9D9D9",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  contadorTexto: {
    fontWeight: "bold",
    fontSize: 14,
  },
  botonGestion: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#424242",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#424242",
  },
  textoBoton: {
    marginLeft: 8,
    color: "white",
    fontWeight: "500",
    fontSize: 14,
  },
  filtrosContainer: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 8,
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
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: "white",
    fontWeight: "500",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingBottom: 16,
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
  // ✅ NUEVOS ESTILOS PARA VIDEO
  videoContainer: {
    width: "100%",
    height: 400,
    backgroundColor: "#000",
  },
  video: {
    width: "100%",
    height: "100%",
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

export default GaleriaScreen;