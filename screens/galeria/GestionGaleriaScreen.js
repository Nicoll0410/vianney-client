/* =========================================================
   screens/galeria/GestionGaleriaScreen.js
   VERSIÓN OPTIMIZADA - Con compresión automática de imágenes
   ========================================================= */
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  Alert,
  TextInput,
  Modal,
  ScrollView,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from 'expo-image-manipulator'; // 🆕 PARA COMPRIMIR
import Footer from "../../components/Footer";
import ConfirmarModal from "../../components/ConfirmarModal";
import InfoModal from "../../components/InfoModal";

const { width } = Dimensions.get("window");
const isMobile = width < 768;

const GestionGaleriaScreen = ({ navigation }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  // Form states
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tipo, setTipo] = useState("imagen");
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const [vistaPreviaUri, setVistaPreviaUri] = useState(null);
  const [activo, setActivo] = useState(true);
  
  // Modals
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [infoModalMessage, setInfoModalMessage] = useState({});

  const fetchItems = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      
      const response = await axios.get(
        "https://vianney-server.onrender.com/galeria",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setItems(response.data.data || []);
      }
    } catch (error) {
      console.error("Error al cargar galería:", error);
      showInfoModal("Error ❌", "Error al cargar la galería");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchItems();
    }, [])
  );

  const showInfoModal = (title, message) => {
    setInfoModalMessage({ title, message });
    setInfoModalVisible(true);
  };

  const resetForm = () => {
    setTitulo("");
    setDescripcion("");
    setTipo("imagen");
    setArchivoSeleccionado(null);
    setVistaPreviaUri(null);
    setActivo(true);
    setIsEditing(false);
    setSelectedItem(null);
  };

  // 🆕 FUNCIÓN MEJORADA: Comprimir y convertir a base64
  const procesarYComprimirImagen = async (uri) => {
    try {
      // Comprimir la imagen
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1200 } }], // Redimensionar a un ancho máximo
        { 
          compress: 0.7, // Compresión del 70%
          format: ImageManipulator.SaveFormat.JPEG,
          base64: true // ✅ IMPORTANTE: generar base64
        }
      );

      // Crear string base64
      const base64Image = `data:image/jpeg;base64,${manipulatedImage.base64}`;
      
      console.log(`Imagen comprimida: ${base64Image.length} caracteres`);
      
      return {
        base64: base64Image,
        uri: manipulatedImage.uri
      };
    } catch (error) {
      console.error("Error al comprimir imagen:", error);
      throw new Error("No se pudo procesar la imagen");
    }
  };

  const solicitarPermisos = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permisos necesarios',
          'Necesitamos acceso a tus fotos para subir contenido.',
          [{ text: 'OK' }]
        );
        return false;
      }
    }
    return true;
  };

  // 🆕 FUNCIÓN MEJORADA: Seleccionar y comprimir imagen
  const seleccionarImagen = async () => {
    const tienePermiso = await solicitarPermisos();
    if (!tienePermiso) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: false, // 🚫 No usar base64 de expo, lo hacemos nosotros
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        
        setUploading(true);
        
        // 🆕 Procesar y comprimir la imagen
        const imagenProcesada = await procesarYComprimirImagen(asset.uri);
        
        setArchivoSeleccionado(imagenProcesada.base64);
        setVistaPreviaUri(imagenProcesada.uri);
        setTipo("imagen");
        
        setUploading(false);
        showInfoModal("Éxito ✅", "Imagen procesada y lista para subir");
      }
    } catch (error) {
      console.error("Error al seleccionar imagen:", error);
      setUploading(false);
      showInfoModal("Error ❌", "Error al procesar la imagen");
    }
  };

  const seleccionarVideo = async () => {
    const tienePermiso = await solicitarPermisos();
    if (!tienePermiso) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.7,
        videoMaxDuration: 60,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        
        // Para videos, usar URI directa (en producción subir a servidor)
        setArchivoSeleccionado(asset.uri);
        setVistaPreviaUri(asset.uri);
        setTipo("video");
        
        showInfoModal(
          "Video seleccionado 🎥", 
          "El video está listo para subir. En producción se recomienda usar servicios como Cloudinary."
        );
      }
    } catch (error) {
      console.error("Error al seleccionar video:", error);
      showInfoModal("Error ❌", "Error al seleccionar el video");
    }
  };

  const abrirModalCrear = () => {
    resetForm();
    setModalVisible(true);
  };

  const abrirModalEditar = (item) => {
    setSelectedItem(item);
    setTitulo(item.titulo);
    setDescripcion(item.descripcion || "");
    setTipo(item.tipo);
    setArchivoSeleccionado(item.url);
    setVistaPreviaUri(item.url);
    setActivo(item.activo);
    setIsEditing(true);
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    // Validaciones básicas
    if (!titulo.trim()) {
      showInfoModal("Error ❌", "El título es obligatorio");
      return;
    }

    if (!isEditing && !archivoSeleccionado) {
      showInfoModal("Error ❌", "Debes seleccionar una imagen o video");
      return;
    }

    try {
      setUploading(true);
      const token = await AsyncStorage.getItem("token");
      
      const data = {
        titulo: titulo.trim(),
        descripcion: descripcion.trim() || null,
        tipo,
        url: archivoSeleccionado,
        miniatura: tipo === "imagen" ? archivoSeleccionado : null,
        orden: items.length,
        activo,
      };

      if (isEditing) {
        await axios.put(
          `https://vianney-server.onrender.com/galeria/${selectedItem.id}`,
          data,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        showInfoModal("Éxito ✅", "Elemento actualizado exitosamente");
      } else {
        await axios.post("https://vianney-server.onrender.com/galeria", data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        showInfoModal("Éxito ✅", "Elemento agregado exitosamente");
      }

      setModalVisible(false);
      resetForm();
      fetchItems();
    } catch (error) {
      console.error("Error al guardar:", error);
      
      let mensajeError = "Error al guardar el elemento";
      
      if (error.response) {
        // Error del servidor
        mensajeError = error.response.data?.mensaje || mensajeError;
        
        // Manejo específico de errores de longitud (por si acaso)
        if (error.response.data?.mensaje?.includes('caracteres')) {
          mensajeError = "La imagen es demasiado grande. Intenta con una imagen más pequeña.";
        }
      } else if (error.request) {
        mensajeError = "No se pudo conectar con el servidor";
      }
      
      showInfoModal("Error ❌", mensajeError);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteConfirmation = (id) => {
    setItemToDelete(id);
    setShowConfirmModal(true);
  };

  const handleDelete = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      await axios.delete(
        `https://vianney-server.onrender.com/galeria/${itemToDelete}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setShowConfirmModal(false);
      showInfoModal("Éxito ✅", "Elemento eliminado exitosamente");
      fetchItems();
    } catch (error) {
      console.error("Error al eliminar:", error);
      showInfoModal("Error ❌", "Error al eliminar el elemento");
    }
  };

  const toggleActivo = async (item) => {
    try {
      const token = await AsyncStorage.getItem("token");
      await axios.patch(
        `https://vianney-server.onrender.com/galeria/${item.id}/toggle-activo`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      fetchItems();
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      showInfoModal("Error ❌", "Error al cambiar el estado");
    }
  };

  const renderItem = ({ item, index }) => {
    const esVideo = item.tipo === "video";
    const urlMostrar = esVideo && item.miniatura ? item.miniatura : item.url;

    return (
      <View style={styles.card}>
        <View style={styles.cardImageContainer}>
          <Image
            source={{ uri: urlMostrar }}
            style={styles.cardImage}
            resizeMode="cover"
          />
          {esVideo && (
            <View style={styles.videoIndicator}>
              <Ionicons name="videocam" size={20} color="white" />
            </View>
          )}
          
          <TouchableOpacity
            style={[
              styles.statusBadge,
              item.activo ? styles.statusBadgeActive : styles.statusBadgeInactive,
            ]}
            onPress={() => toggleActivo(item)}
          >
            <Text style={styles.statusText}>
              {item.activo ? "Visible" : "Oculto"}
            </Text>
          </TouchableOpacity>
          
          <View style={styles.positionBadge}>
            <Text style={styles.positionText}>#{index + 1}</Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.titulo}
          </Text>
          {item.descripcion && (
            <Text style={styles.cardDescription} numberOfLines={2}>
              {item.descripcion}
            </Text>
          )}
          <View style={styles.cardMeta}>
            <Text style={styles.cardMetaText}>
              {item.tipo === "imagen" ? "📷 Foto" : "🎥 Video"}
            </Text>
            <Text style={styles.cardMetaText}>
              {item.activo ? "Los clientes lo ven" : "Solo tú lo ves"}
            </Text>
          </View>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => abrirModalEditar(item)}
          >
            <Ionicons name="pencil" size={20} color="#424242" />
            <Text style={styles.actionButtonText}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteConfirmation(item.id)}
          >
            <Ionicons name="trash-outline" size={20} color="#d32f2f" />
            <Text style={[styles.actionButtonText, { color: "#d32f2f" }]}>
              Eliminar
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.tituloContainer}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#424242" />
            </TouchableOpacity>
            <Text style={styles.titulo}>Gestionar Galería</Text>
          </View>
          <TouchableOpacity
            style={styles.botonHeader}
            onPress={abrirModalCrear}
            activeOpacity={0.7}
          >
            <Ionicons name="add-circle" size={20} color="white" />
            <Text style={styles.textoBoton}>Agregar</Text>
          </TouchableOpacity>
        </View>

        {/* Información mejorada */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color="#2196F3" />
          <Text style={styles.infoText}>
            Las imágenes se comprimen automáticamente. Puedes subir fotos sin límite de tamaño.
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#424242" />
            <Text style={styles.loadingText}>Cargando galería...</Text>
          </View>
        ) : items.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="images-outline" size={80} color="#ccc" />
            <Text style={styles.emptyText}>
              No hay elementos en la galería
            </Text>
            <Text style={styles.emptySubtext}>
              Agrega fotos o videos para mostrar tu trabajo
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={abrirModalCrear}
            >
              <Text style={styles.emptyButtonText}>Comenzar a agregar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            numColumns={isMobile ? 1 : 3}
            key={isMobile ? "mobile" : "desktop"}
            contentContainerStyle={styles.listContainer}
          />
        )}

        {/* Modal de crear/editar */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent
          onRequestClose={() => {
            setModalVisible(false);
            resetForm();
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {isEditing ? "Editar elemento" : "Agregar elemento"}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setModalVisible(false);
                    resetForm();
                  }}
                >
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={styles.formContainer}>
                {/* Selector de archivo */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>
                    Archivo <Text style={styles.required}>*</Text>
                  </Text>
                  
                  <View style={styles.fileButtonsContainer}>
                    <TouchableOpacity
                      style={[styles.fileButton, tipo === "imagen" && styles.fileButtonActive]}
                      onPress={seleccionarImagen}
                      disabled={uploading}
                    >
                      {uploading ? (
                        <ActivityIndicator size="small" color={tipo === "imagen" ? "white" : "#424242"} />
                      ) : (
                        <>
                          <Ionicons name="image" size={24} color={tipo === "imagen" ? "white" : "#424242"} />
                          <Text style={[styles.fileButtonText, tipo === "imagen" && styles.fileButtonTextActive]}>
                            Elegir Foto
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.fileButton, tipo === "video" && styles.fileButtonActive]}
                      onPress={seleccionarVideo}
                      disabled={uploading}
                    >
                      <Ionicons name="videocam" size={24} color={tipo === "video" ? "white" : "#424242"} />
                      <Text style={[styles.fileButtonText, tipo === "video" && styles.fileButtonTextActive]}>
                        Elegir Video
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Vista previa */}
                  {vistaPreviaUri && (
                    <View style={styles.previewContainer}>
                      <Image
                        source={{ uri: vistaPreviaUri }}
                        style={styles.previewImage}
                        resizeMode="cover"
                      />
                      <TouchableOpacity
                        style={styles.removePreviewButton}
                        onPress={() => {
                          setArchivoSeleccionado(null);
                          setVistaPreviaUri(null);
                        }}
                      >
                        <Ionicons name="close-circle" size={30} color="#d32f2f" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {/* Título */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>
                    Título <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={titulo}
                    onChangeText={setTitulo}
                    placeholder="Ej: Corte degradado moderno"
                    placeholderTextColor="#999"
                  />
                </View>

                {/* Descripción */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Descripción (opcional)</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={descripcion}
                    onChangeText={setDescripcion}
                    placeholder="Describe el trabajo realizado, productos usados, etc."
                    placeholderTextColor="#999"
                    multiline
                    numberOfLines={3}
                  />
                </View>

                {/* Estado visible */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Visibilidad</Text>
                  <View style={styles.switchContainer}>
                    <View>
                      <Text style={styles.switchLabel}>
                        {activo ? "✅ Visible para clientes" : "❌ Oculto (solo tú lo ves)"}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.switch,
                        activo ? styles.switchActive : styles.switchInactive,
                      ]}
                      onPress={() => setActivo(!activo)}
                    >
                      <View
                        style={[
                          styles.switchThumb,
                          activo
                            ? styles.switchThumbActive
                            : styles.switchThumbInactive,
                        ]}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Botón de guardar */}
                <TouchableOpacity
                  style={[styles.submitButton, uploading && styles.submitButtonDisabled]}
                  onPress={handleSubmit}
                  disabled={uploading}
                >
                  {uploading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.submitButtonText}>
                      {isEditing ? "Actualizar" : "Guardar"}
                    </Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>

        <ConfirmarModal
          visible={showConfirmModal}
          onCancel={() => setShowConfirmModal(false)}
          onConfirm={handleDelete}
          title="¿Eliminar este elemento?"
          message="Esta acción no se puede deshacer. El contenido se eliminará permanentemente."
        />

        <InfoModal
          visible={infoModalVisible}
          onClose={() => setInfoModalVisible(false)}
          title={infoModalMessage.title}
          message={infoModalMessage.message}
        />
      </View>

      <Footer />
    </View>
  );
};

// Los estilos se mantienen igual que en tu versión anterior
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
  backButton: {
    marginRight: 12,
  },
  titulo: {
    fontSize: 22,
    fontWeight: "bold",
  },
  botonHeader: {
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
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E3F2FD",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: "#1976D2",
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
    fontWeight: "600",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
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
    fontSize: 14,
  },
  listContainer: {
    paddingBottom: 16,
  },
  card: {
    flex: 1,
    margin: 8,
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#eee",
  },
  cardImageContainer: {
    width: "100%",
    height: 150,
    position: "relative",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  videoIndicator: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusBadgeActive: {
    backgroundColor: "#4CAF50",
  },
  statusBadgeInactive: {
    backgroundColor: "#9E9E9E",
  },
  statusText: {
    color: "white",
    fontSize: 11,
    fontWeight: "600",
  },
  positionBadge: {
    position: "absolute",
    bottom: 8,
    left: 8,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  positionText: {
    color: "white",
    fontSize: 11,
    fontWeight: "600",
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
    color: "#333",
  },
  cardDescription: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  cardMeta: {
    flexDirection: "column",
    gap: 4,
  },
  cardMetaText: {
    fontSize: 11,
    color: "#999",
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  actionButtonText: {
    fontSize: 13,
    color: "#424242",
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: isMobile ? "90%" : "50%",
    maxHeight: "90%",
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  formContainer: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
    color: "#333",
  },
  required: {
    color: "#d32f2f",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: "#fafafa",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  fileButtonsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  fileButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    borderWidth: 2,
    borderColor: "#424242",
    borderRadius: 8,
    backgroundColor: "white",
  },
  fileButtonActive: {
    backgroundColor: "#424242",
    borderColor: "#424242",
  },
  fileButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#424242",
  },
  fileButtonTextActive: {
    color: "white",
  },
  previewContainer: {
    marginTop: 12,
    position: "relative",
    borderRadius: 8,
    overflow: "hidden",
  },
  previewImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
  },
  removePreviewButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "white",
    borderRadius: 15,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  switch: {
    width: 50,
    height: 28,
    borderRadius: 14,
    padding: 2,
    justifyContent: "center",
  },
  switchActive: {
    backgroundColor: "#4CAF50",
    alignItems: "flex-end",
  },
  switchInactive: {
    backgroundColor: "#ccc",
    alignItems: "flex-start",
  },
  switchThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "white",
  },
  submitButton: {
    backgroundColor: "#424242",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: "#999",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default GestionGaleriaScreen;