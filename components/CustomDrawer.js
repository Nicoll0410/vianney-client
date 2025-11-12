import React, { useState, useContext } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import {
  FontAwesome5,
  MaterialIcons,
  Feather,
  Ionicons,
  AntDesign,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { AuthContext } from "../contexts/AuthContext";

/* ─────────────────── MENÚ SEGÚN ROL ─────────────────────────── */
const ROLE_MENU = {
  Cliente: {
    topItems: [
      { label: "Galería", screen: "Galeria", icon: Ionicons, name: "images-outline" },
      { label: "Agenda", screen: "Agenda", icon: MaterialIcons, name: "event" },
      { label: "Citas", screen: "Citas", icon: Ionicons, name: "calendar-outline" },
    ],
    sections: {},
  },
  Barbero: {
    topItems: [],
    sections: {
      Usuarios: [
        { label: "Clientes", screen: "Clientes", icon: Feather, name: "user" },
      ],
      Compras: [
        { label: "Movimientos", screen: "Movimientos", icon: FontAwesome5, name: "exchange-alt" },
      ],
      Ventas: [
        { label: "Galería", screen: "Galeria", icon: Ionicons, name: "images-outline" },
        { label: "Agenda", screen: "Agenda", icon: MaterialIcons, name: "event" },
        { label: "Citas", screen: "Citas", icon: Ionicons, name: "calendar-outline" },
      ],
    },
  },
  Administrador: {
    topItems: [
      { label: "Dashboard", screen: "Dashboard", icon: MaterialCommunityIcons, name: "view-dashboard-outline" },
    ],
    sections: {
      Usuarios: [
        { label: "Clientes", screen: "Clientes", icon: Feather, name: "user" },
        { label: "Barberos", screen: "Barberos", icon: Ionicons, name: "cut-outline" },
        { label: "Roles", screen: "Roles", icon: Ionicons, name: "key-outline" },
      ],
      Compras: [
        { label: "Categoría de Insumos", screen: "CategoriaInsumos", icon: MaterialCommunityIcons, name: "database-arrow-left-outline" },
        { label: "Insumos", screen: "Insumos", icon: MaterialCommunityIcons, name: "spray" },
        { label: "Proveedores", screen: "Proveedores", icon: MaterialCommunityIcons, name: "toolbox-outline" },
        { label: "Compras", screen: "Compras", icon: AntDesign, name: "shoppingcart" },
      ],
      Ventas: [
        { label: "Galería", screen: "Galeria", icon: Ionicons, name: "images-outline" },
        { label: "Movimientos", screen: "Movimientos", icon: FontAwesome5, name: "exchange-alt" },
        { label: "Servicios", screen: "Servicios", icon: MaterialCommunityIcons, name: "toolbox-outline" },
        { label: "Agenda", screen: "Agenda", icon: MaterialIcons, name: "event" },
        { label: "Citas", screen: "Citas", icon: Ionicons, name: "calendar-outline" },
        { label: "Ventas", screen: "Ventas", icon: Ionicons, name: "cash-outline" },
      ],
    },
  },
};

/* ─────────────────── COMPONENTE DRAWER ──────────────────────── */
const CustomDrawer = (props) => {
  const { userRole, user, logout } = useContext(AuthContext);

  const roleKey = userRole || "Administrador";
  const config  = ROLE_MENU[roleKey];

  /* Estado para secciones colapsables */
  const [expanded, setExpanded] = useState({
    Usuarios: true,
    Compras: true,
    Ventas:  true,
  });
  const toggle = (sec) => setExpanded((p) => ({ ...p, [sec]: !p[sec] }));

  /* Renderiza un ítem normal */
  const Item = ({ label, screen, icon: IconComp, name, indent = 0 }) => (
    <TouchableOpacity
      style={[styles.menuItem, indent && { paddingLeft: 40 }]}
      onPress={() => {
        props.navigation.navigate(screen);
        if (props.navigation.closeDrawer) {
          props.navigation.closeDrawer();
        }
      }}
    >
      <IconComp name={name} size={20} color="#666" />
      <Text style={[styles.menuText, indent && styles.subMenuText]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* ----------- Header con Logo ------------ */}
      <View style={styles.header}>
        <Image source={require("../assets/images/vianney.jpg")} style={styles.logo} />
        <Text style={styles.headerTitle}>New York Barber</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* Sección Menu */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Menu</Text>
          
          {/* Dashboard siempre visible */}
          {config.topItems.map((item) => (
            <Item key={item.label} {...item} />
          ))}

          {/* Secciones expandibles */}
          {Object.entries(config.sections).map(([section, items]) => (
            <View key={section} style={styles.sectionContainer}>
              <TouchableOpacity 
                style={styles.sectionHeader}
                onPress={() => toggle(section)}
                activeOpacity={0.7}
              >
                <Text style={styles.sectionHeaderText}>{section}</Text>
                <Feather 
                  name={expanded[section] ? "chevron-up" : "chevron-down"} 
                  size={18} 
                  color="#666" 
                />
              </TouchableOpacity>

              {expanded[section] && (
                <View style={styles.subItemsContainer}>
                  {items.map((sub) => (
                    <Item key={sub.label} {...sub} indent={20} />
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* ------------- Perfil Section ------------- */}
      <View style={styles.profileSection}>
        <View style={styles.profileHeader}>
          <Text style={styles.profileTitle}>Perfil</Text>
        </View>
        
        <View style={styles.userInfo}>
          <View style={styles.avatarContainer}>
            {user?.imagen ? (
              <Image source={{ uri: user.imagen }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Feather name="user" size={20} color="#666" />
              </View>
            )}
          </View>
          
          <View style={styles.userDetails}>
            <Text style={styles.username}>
              {user?.nombre || user?.email?.split("@")[0] || "nybarber2025"}
            </Text>
            <Text style={styles.userEmail}>
              {user?.email || "nybarber2025@gmail.com"}
            </Text>
            <Text style={styles.userRole}>{roleKey}</Text>
          </View>
        </View>

        {/* Botón Cerrar sesión */}
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Feather name="log-out" size={16} color="#fff" />
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

/* ─────────────────── Estilos ────────────────────── */
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#fff" 
  },
  scrollContainer: { 
    flexGrow: 1 
  },
  header: {
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#e0e0e0"
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: "cover",
    borderRadius: 40,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: "#e0e0e0"
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center"
  },
  menuSection: {
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#f8f8f8"
  },
  sectionContainer: {
    marginBottom: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#f0f0f0"
  },
  sectionHeaderText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000"
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: "#fff"
  },
  menuText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000",
    marginLeft: 15
  },
  subMenuText: {
    fontSize: 14,
    color: "#666"
  },
  subItemsContainer: {
    backgroundColor: "#fafafa"
  },
  profileSection: {
    padding: 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#e0e0e0"
  },
  profileHeader: {
    marginBottom: 15
  },
  profileTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000"
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20
  },
  avatarContainer: {
    marginRight: 12
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#e0e0e0"
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#e0e0e0"
  },
  userDetails: {
    flex: 1
  },
  username: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2
  },
  userEmail: {
    color: "#666",
    fontSize: 14,
    marginBottom: 2
  },
  userRole: {
    color: "#888",
    fontSize: 12,
    fontStyle: "italic"
  },
  logoutButton: {
    flexDirection: "row",
    backgroundColor: "#000",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center"
  },
  logoutText: {
    color: "#fff",
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "600"
  }
});

export default CustomDrawer;