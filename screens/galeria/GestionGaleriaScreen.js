/* =========================================================
   screens/galeria/GestionGaleriaScreen.js
   Pantalla de gestión CRUD (solo Admin y Barberos)
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
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Picker } from "@react-native-picker/picker";
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
  
  // Form states
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tipo, setTipo] = useState("imagen");
  const [url, setUrl] = useState("");
  const [miniatura, setMiniatura] = useState("");
  const [orden, setOrden] = useState("0");
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
      showInfoModal("Error ❌", "No se pudo cargar la galería");
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
    setUrl("");
    setMiniatura("");
    setOrden("0");
    setActivo(true);
    setIsEditing(false);
    setSelectedItem(null);
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
    setUrl(item.url);
    setMiniatura(item.miniatura || "");
    setOrden(item.orden.toString());
    setActivo(item.activo);
    setIsEditing(true);
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    if (!titulo.trim() || !url.trim()) {
      showInfoModal("Error ❌", "El título y la URL son obligatorios");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");
      const data = {
        titulo: titulo.trim(),
        descripcion: descripcion.trim() || null,
        tipo,
        url: url.trim(),
        miniatura: miniatura.trim() || null,
        orden: parseInt(orden) || 0,
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
      showInfoModal(
        "Error ❌",
        error.response?.data?.mensaje || "Error al guardar el elemento"
      );
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
      showInfoModal(
        "Error ❌",
        error.response?.data?.mensaje || "Error al eliminar el elemento"
      );
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

  const renderItem = ({ item }) => {
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
              {item.activo ? "Activo" : "Inactivo"}
            </Text>
          </TouchableOpacity>
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
            <Text style={styles.cardMetaText}>Orden: {item.orden}</Text>
            <Text style={styles.cardMetaText}>
              {item.tipo === "imagen" ? "Imagen" : "Video"}
            </Text>
          </View>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => abrirModalEditar(item)}
          >
            <Ionicons name="pencil" size={20} color="#424242" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteConfirmation(item.id)}
          >
            <Ionicons name="trash-outline" size={20} color="#d32f2f" />
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
            <Text style={styles.titulo}>Gestión de Galería</Text>
            <View style={styles.contadorContainer}>
              <Text style={styles.contadorTexto}>{items.length}</Text>
            </View>
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

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#424242" />
            <Text style={styles.loadingText}>Cargando...</Text>
          </View>
        ) : items.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="images-outline" size={80} color="#ccc" />
            <Text style={styles.emptyText}>
              No hay elementos en la galería
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={abrirModalCrear}
            >
              <Text style={styles.emptyButtonText}>Agregar primer elemento</Text>
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
                <View style={styles.formGroup}>
                  <Text style={styles.label}>
                    Título <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={titulo}
                    onChangeText={setTitulo}
                    placeholder="Ej: Corte degradado"
                    placeholderTextColor="#999"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Descripción</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={descripcion}
                    onChangeText={setDescripcion}
                    placeholder="Descripción del elemento"
                    placeholderTextColor="#999"
                    multiline
                    numberOfLines={3}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>
                    Tipo <Text style={styles.required}>*</Text>
                  </Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={tipo}
                      onValueChange={setTipo}
                      style={styles.picker}
                    >
                      <Picker.Item label="Imagen" value="imagen" />
                      <Picker.Item label="Video" value="video" />
                    </Picker>
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>
                    URL <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={url}
                    onChangeText={setUrl}
                    placeholder="https://ejemplo.com/imagen.jpg"
                    placeholderTextColor="#999"
                    autoCapitalize="none"
                  />
                  <Text style={styles.helperText}>
                    Puede ser una URL externa o datos base64
                  </Text>
                </View>

                {tipo === "video" && (
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Miniatura (URL)</Text>
                    <TextInput
                      style={styles.input}
                      value={miniatura}
                      onChangeText={setMiniatura}
                      placeholder="https://ejemplo.com/miniatura.jpg"
                      placeholderTextColor="#999"
                      autoCapitalize="none"
                    />
                  </View>
                )}

                <View style={styles.formRow}>
                  <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.label}>Orden</Text>
                    <TextInput
                      style={styles.input}
                      value={orden}
                      onChangeText={setOrden}
                      placeholder="0"
                      placeholderTextColor="#999"
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Estado</Text>
                    <View style={styles.switchContainer}>
                      <Text style={styles.switchLabel}>
                        {activo ? "Activo" : "Inactivo"}
                      </Text>
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
                </View>

                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleSubmit}
                >
                  <Text style={styles.submitButtonText}>
                    {isEditing ? "Actualizar" : "Guardar"}
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>

        <ConfirmarModal
          visible={showConfirmModal}
          onCancel={() => setShowConfirmModal(false)}
          onConfirm={handleDelete}
          title="Confirmar eliminación ⚠️"
          message="¿Estás seguro de que deseas eliminar este elemento? Esta acción no se puede deshacer."
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
    paddingHorizontal: 8,
    paddingVertical: 4,
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
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardMetaText: {
    fontSize: 11,
    color: "#999",
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  actionButton: {
    marginLeft: 16,
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
    marginBottom: 16,
  },
  formRow: {
    flexDirection: "row",
    marginBottom: 16,
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
  helperText: {
    fontSize: 11,
    color: "#999",
    marginTop: 4,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fafafa",
  },
  picker: {
    height: 50,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 14,
    color: "#666",
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
  switchThumbActive: {},
  switchThumbInactive: {},
  submitButton: {
    backgroundColor: "#424242",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default GestionGaleriaScreen;