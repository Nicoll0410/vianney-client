/* =========================================================
   screens/galeria/GestionGaleriaScreen.js
   VERSIÓN SIN @react-native-picker/picker
   ========================================================= */
import React, { useState, useEffect, useCallback, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  TextInput,
  Modal,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import Footer from "../../components/Footer";
import ConfirmarModal from "../../components/ConfirmarModal";
import InfoModal from "../../components/InfoModal";
import { AuthContext } from "../../contexts/AuthContext";

const { width } = Dimensions.get("window");
const isMobile = width < 768;

const GestionGaleriaScreen = ({ navigation }) => {
  const { user, userRole, barberData } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [barberos, setBarberos] = useState([]);
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
  const [barberoSeleccionado, setBarberoSeleccionado] = useState("");
  const [esDestacada, setEsDestacada] = useState(false);
  
  // Modal para selector de barbero
  const [showBarberoPicker, setShowBarberoPicker] = useState(false);
  
  // Modals
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [infoModalMessage, setInfoModalMessage] = useState({});

  const getToken = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      return token;
    } catch (error) {
      console.error("Error obteniendo token:", error);
      return null;
    }
  };

  const fetchBarberos = async () => {
    try {
      const token = await getToken();
      const response = await axios.get(
        "https://vianney-server.onrender.com/barberos",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data) {
        setBarberos(response.data);
        
        if (userRole === "Barbero" && barberData?.id) {
          setBarberoSeleccionado(barberData.id);
        }
      }
    } catch (error) {
      console.error("Error al cargar barberos:", error);
    }
  };

  const fetchItems = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      
      const params = {};
      if (userRole === "Barbero" && barberData?.id) {
        params.barberoID = barberData.id;
      }
      
      const response = await axios.get(
        "https://vianney-server.onrender.com/galeria",
        { 
          headers: { Authorization: `Bearer ${token}` },
          params
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
    fetchBarberos();
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
    setEsDestacada(false);
    setIsEditing(false);
    setSelectedItem(null);
    
    if (userRole === "Barbero" && barberData?.id) {
      setBarberoSeleccionado(barberData.id);
    } else {
      setBarberoSeleccionado("");
    }
  };

  const seleccionarImagen = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showInfoModal("Permisos necesarios", "Necesitamos acceso a tu galería.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        
        if (asset.base64) {
          const base64Image = `data:image/jpeg;base64,${asset.base64}`;
          setArchivoSeleccionado(base64Image);
          setVistaPreviaUri(asset.uri);
          setTipo("imagen");
          showInfoModal("Éxito ✅", `Imagen lista para subir`);
        }
      }
    } catch (error) {
      console.error("Error al seleccionar imagen:", error);
      showInfoModal("Error ❌", "Error al seleccionar la imagen");
    }
  };

  const seleccionarVideo = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showInfoModal("Permisos necesarios", "Necesitamos acceso a tus videos.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.8,
        videoMaxDuration: 120,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        setArchivoSeleccionado(asset.uri);
        setVistaPreviaUri(asset.uri);
        setTipo("video");
        showInfoModal("Video seleccionado 🎥", "El video está listo para subir.");
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
    setBarberoSeleccionado(item.barberoID);
    setEsDestacada(item.esDestacada || false);
    setIsEditing(true);
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    if (!titulo.trim()) {
      showInfoModal("Error ❌", "El título es obligatorio");
      return;
    }

    if (!barberoSeleccionado) {
      showInfoModal("Error ❌", "Debes seleccionar un barbero");
      return;
    }

    if (!isEditing && !archivoSeleccionado) {
      showInfoModal("Error ❌", "Debes seleccionar una imagen o video");
      return;
    }

    try {
      setUploading(true);
      const token = await getToken();
      
      const data = {
        titulo: titulo.trim(),
        descripcion: descripcion.trim() || null,
        tipo,
        url: archivoSeleccionado,
        miniatura: tipo === "imagen" ? archivoSeleccionado : null,
        orden: items.length,
        activo,
        barberoID: barberoSeleccionado,
        esDestacada,
      };

      const headers = { Authorization: `Bearer ${token}` };

      if (isEditing) {
        await axios.put(
          `https://vianney-server.onrender.com/galeria/${selectedItem.id}`,
          data,
          { headers }
        );
        showInfoModal("Éxito ✅", "Elemento actualizado exitosamente");
      } else {
        await axios.post(
          "https://vianney-server.onrender.com/galeria", 
          data, 
          { headers }
        );
        showInfoModal("Éxito ✅", "Elemento agregado exitosamente");
      }

      setModalVisible(false);
      resetForm();
      fetchItems();
    } catch (error) {
      console.error("❌ ERROR al guardar:", error);
      showInfoModal("Error ❌", error.response?.data?.mensaje || "Error al guardar");
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
      const token = await getToken();
      await axios.delete(
        `https://vianney-server.onrender.com/galeria/${itemToDelete}`,
        { headers: { Authorization: `Bearer ${token}` } }
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
      const token = await getToken();
      await axios.patch(
        `https://vianney-server.onrender.com/galeria/${item.id}/toggle-activo`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchItems();
    } catch (error) {
      console.error("Error al cambiar estado:", error);
    }
  };

  const toggleDestacada = async (item) => {
    try {
      const token = await getToken();
      await axios.patch(
        `https://vianney-server.onrender.com/galeria/${item.id}/toggle-destacada`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchItems();
    } catch (error) {
      console.error("Error al cambiar destacada:", error);
    }
  };

  const renderItem = ({ item, index }) => {
    const esVideo = item.tipo === "video";
    const urlMostrar = esVideo && item.miniatura ? item.miniatura : item.url;
    const barbero = barberos.find(b => b.id === item.barberoID);

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
          
          {item.esDestacada && (
            <TouchableOpacity
              style={styles.destacadaBadge}
              onPress={() => toggleDestacada(item)}
            >
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.destacadaTexto}>Destacada</Text>
            </TouchableOpacity>
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
        </View>

        <View style={styles.cardContent}>
          <View style={styles.barberoInfo}>
            <Image
              source={
                barbero?.avatar
                  ? { uri: barbero.avatar }
                  : require("../../assets/avatar.png")
              }
              style={styles.barberoAvatar}
            />
            <Text style={styles.barberoNombre}>{barbero?.nombre || "Barbero"}</Text>
          </View>

          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.titulo}
          </Text>
          {item.descripcion && (
            <Text style={styles.cardDescription} numberOfLines={2}>
              {item.descripcion}
            </Text>
          )}
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => abrirModalEditar(item)}
          >
            <Ionicons name="pencil" size={20} color="#424242" />
            <Text style={styles.actionButtonText}>Editar</Text>
          </TouchableOpacity>
          
          {!item.esDestacada && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => toggleDestacada(item)}
            >
              <Ionicons name="star-outline" size={20} color="#FFD700" />
              <Text style={[styles.actionButtonText, { color: "#FFD700" }]}>
                Destacar
              </Text>
            </TouchableOpacity>
          )}
          
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

        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color="#2196F3" />
          <Text style={styles.infoText}>
            💡 Marca una imagen como "Destacada" para que aparezca en la tarjeta principal del barbero
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
                {/* Selector de barbero personalizado */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>
                    Barbero <Text style={styles.required}>*</Text>
                  </Text>
                  
                  <TouchableOpacity
                    style={styles.customPickerButton}
                    onPress={() => {
                      if (userRole === "Administrador") {
                        setShowBarberoPicker(true);
                      }
                    }}
                    disabled={userRole !== "Administrador"}
                  >
                    <Text style={styles.customPickerText}>
                      {barberoSeleccionado
                        ? barberos.find((b) => b.id === barberoSeleccionado)?.nombre || "Selecciona un barbero"
                        : "Selecciona un barbero"}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#666" />
                  </TouchableOpacity>

                  {userRole === "Barbero" && (
                    <Text style={styles.helperText}>
                      Como barbero, solo puedes agregar a tu galería
                    </Text>
                  )}
                </View>

                {/* Archivo */}
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
                      <Ionicons name="image" size={24} color={tipo === "imagen" ? "white" : "#424242"} />
                      <Text style={[styles.fileButtonText, tipo === "imagen" && styles.fileButtonTextActive]}>
                        Elegir Foto
                      </Text>
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
                    placeholder="Describe el trabajo realizado"
                    placeholderTextColor="#999"
                    multiline
                    numberOfLines={3}
                  />
                </View>

                {/* Switch Destacada */}
                <View style={styles.formGroup}>
                  <View style={styles.switchContainer}>
                    <View>
                      <Text style={styles.switchLabel}>
                        ⭐ Marcar como destacada
                      </Text>
                      <Text style={styles.switchSubLabel}>
                        Aparecerá en la tarjeta principal del barbero
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.switch,
                        esDestacada ? styles.switchActive : styles.switchInactive,
                      ]}
                      onPress={() => setEsDestacada(!esDestacada)}
                    >
                      <View
                        style={[
                          styles.switchThumb,
                          esDestacada
                            ? styles.switchThumbActive
                            : styles.switchThumbInactive,
                        ]}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Switch Visibilidad */}
                <View style={styles.formGroup}>
                  <View style={styles.switchContainer}>
                    <View>
                      <Text style={styles.switchLabel}>
                        {activo ? "✅ Visible para clientes" : "❌ Oculto"}
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

        {/* Modal selector de barberos */}
        <Modal
          visible={showBarberoPicker}
          animationType="slide"
          transparent
          onRequestClose={() => setShowBarberoPicker(false)}
        >
          <View style={styles.pickerModalOverlay}>
            <View style={styles.pickerModalContent}>
              <View style={styles.pickerModalHeader}>
                <Text style={styles.pickerModalTitle}>Seleccionar Barbero</Text>
                <TouchableOpacity onPress={() => setShowBarberoPicker(false)}>
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              
              <ScrollView>
                {barberos.map((barbero) => (
                  <TouchableOpacity
                    key={barbero.id}
                    style={[
                      styles.pickerOption,
                      barberoSeleccionado === barbero.id && styles.pickerOptionSelected,
                    ]}
                    onPress={() => {
                      setBarberoSeleccionado(barbero.id);
                      setShowBarberoPicker(false);
                    }}
                  >
                    <Image
                      source={
                        barbero.avatar
                          ? { uri: barbero.avatar }
                          : require("../../assets/avatar.png")
                      }
                      style={styles.pickerOptionAvatar}
                    />
                    <Text style={styles.pickerOptionText}>{barbero.nombre}</Text>
                    {barberoSeleccionado === barbero.id && (
                      <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        <ConfirmarModal
          visible={showConfirmModal}
          onCancel={() => setShowConfirmModal(false)}
          onConfirm={handleDelete}
          title="¿Eliminar este elemento?"
          message="Esta acción no se puede deshacer."
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
  },
  botonHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#424242",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 15,
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
  destacadaBadge: {
    position: "absolute",
    bottom: 8,
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
  cardContent: {
    padding: 12,
  },
  barberoInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  barberoAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  barberoNombre: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
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
  customPickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fafafa",
  },
  customPickerText: {
    fontSize: 14,
    color: "#333",
  },
  helperText: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
    fontStyle: "italic",
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
  switchSubLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
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
  // Estilos para el modal selector de barbero
  pickerModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  pickerModalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
    paddingBottom: 20,
  },
  pickerModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  pickerModalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  pickerOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    gap: 12,
  },
  pickerOptionSelected: {
    backgroundColor: "#f0f9ff",
  },
  pickerOptionAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  pickerOptionText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
});

export default GestionGaleriaScreen;