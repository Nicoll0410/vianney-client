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
    Usuarios: false,
    Compras: false,
    Ventas:  false,
  });
  const toggle = (sec) => setExpanded((p) => ({ ...p, [sec]: !p[sec] }));

  /* Renderiza un ítem normal */
  const Item = ({ label, screen, icon: IconComp, name, indent = 0 }) => (
    <TouchableOpacity
      style={[styles.menuItem, indent && { paddingLeft: 20 + indent }]}
      onPress={() => {
        props.navigation.navigate(screen);
        if (props.navigation.closeDrawer) {
          props.navigation.closeDrawer();
        }
      }}
    >
      <View style={[styles.iconContainer, indent && styles.subIconContainer]}>
        <IconComp name={name} size={indent ? 16 : 20} color="#fff" />
      </View>
      <Text style={[styles.menuText, indent && styles.subMenuText]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* ----------- Logo superior ------------ */}
      <View style={styles.logoContainer}>
        <Image source={require("../assets/images/vianney.jpg")} style={styles.logo} />
        <Text style={styles.logoTitle}>New York Barber</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* Sección Menú */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Menu</Text>
          
          {config.topItems.map((item) => <Item key={item.label} {...item} />)}

          {Object.entries(config.sections).map(([section, items]) => (
            <View key={section} style={styles.sectionContainer}>
              <TouchableOpacity 
                style={styles.expandableItem} 
                onPress={() => toggle(section)}
                activeOpacity={0.7}
              >
                <View style={styles.menuRow}>
                  <View style={styles.sectionIconContainer}>
                    {section === "Usuarios" && <Feather name="users" size={20} color="#fff" />}
                    {section === "Compras" && <AntDesign name="shoppingcart" size={20} color="#fff" />}
                    {section === "Ventas"   && <MaterialCommunityIcons name="account-cash-outline" size={20} color="#fff" />}
                  </View>
                  <Text style={styles.sectionText}>{section}</Text>
                </View>
                <Feather 
                  name={expanded[section] ? "chevron-up" : "chevron-down"} 
                  size={18} 
                  color="#fff" 
                />
              </TouchableOpacity>

              {expanded[section] && (
                <View style={styles.subItemsContainer}>
                  {items.map((sub) => <Item key={sub.label} {...sub} indent={20} />)}
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* ------------- Perfil abajo ------------- */}
      <View style={styles.profileSection}>
        <Text style={styles.profileTitle}>Perfil</Text>
        <View style={styles.userContainer}>
          {user?.imagen ? (
            <Image source={{ uri: user.imagen }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Feather name="user" size={20} color="#fff" />
            </View>
          )}

          <View style={styles.userInfoContainer}>
            <Text style={styles.userName}>
              {user?.nombre || user?.email?.split("@")[0] || "Usuario"}
            </Text>
            <Text style={styles.userEmail}>
              {user?.email || "ejemplo@dominio.com"}
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
    backgroundColor: "#1a1a1a" 
  },
  scrollContainer: { 
    flexGrow: 1 
  },
  logoContainer: { 
    alignItems: "center", 
    paddingVertical: 25, 
    paddingHorizontal: 20,
    backgroundColor: "#000",
    borderBottomWidth: 1, 
    borderColor: "#333" 
  },
  logo: { 
    width: 80, 
    height: 80, 
    resizeMode: "contain",
    borderRadius: 40,
    marginBottom: 12
  },
  logoTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center"
  },
  menuSection: {
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#2a2a2a",
    marginBottom: 5
  },
  sectionContainer: {
    marginBottom: 5,
  },
  expandableItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: "#2a2a2a",
    borderBottomWidth: 1,
    borderColor: "#333"
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center"
  },
  sectionIconContainer: {
    width: 24,
    alignItems: "center",
    marginRight: 12
  },
  sectionText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff"
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingLeft: 20,
    backgroundColor: "#2a2a2a",
    borderBottomWidth: 1,
    borderColor: "#333"
  },
  iconContainer: {
    width: 24,
    alignItems: "center",
    marginRight: 12
  },
  subIconContainer: {
    width: 20,
    marginRight: 8
  },
  menuText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#fff"
  },
  subMenuText: {
    fontSize: 13,
    color: "#e0e0e0"
  },
  subItemsContainer: {
    backgroundColor: "#222"
  },
  profileSection: {
    padding: 20,
    backgroundColor: "#000",
    borderTopWidth: 1,
    borderColor: "#333"
  },
  profileTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 15
  },
  userContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    borderWidth: 2,
    borderColor: "#444"
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 2,
    borderColor: "#444"
  },
  userInfoContainer: {
    flex: 1
  },
  userName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2
  },
  userEmail: {
    color: "#aaa",
    fontSize: 13,
    marginBottom: 2
  },
  userRole: {
    color: "#888",
    fontSize: 12,
    fontStyle: "italic"
  },
  logoutButton: {
    flexDirection: "row",
    backgroundColor: "#d4af37",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#b8941f"
  },
  logoutText: {
    color: "#000",
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "700"
  }
});

export default CustomDrawer;