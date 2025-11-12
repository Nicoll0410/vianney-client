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
      Ventas: [
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
    Ventas: true,
  });
  const toggle = (sec) => setExpanded((p) => ({ ...p, [sec]: !p[sec] }));

  /* Renderiza un ítem normal */
  const Item = ({ label, screen, icon: IconComp, name, indent = 0 }) => (
    <TouchableOpacity
      style={[styles.menuItem, indent && { paddingLeft: 24 }]}
      onPress={() => {
        props.navigation.navigate(screen);
        if (props.navigation.closeDrawer) {
          props.navigation.closeDrawer();
        }
      }}
    >
      <IconComp name={name} size={20} color="#666" />
      <Text style={styles.menuText}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* ----------- Header con Logo ------------ */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>New York Barber</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* Sección Menu */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Menu</Text>
          
          {/* Dashboard */}
          {config.topItems.map((item) => (
            <Item key={item.label} {...item} />
          ))}

          {/* Sección Usuarios */}
          <View style={styles.sectionContainer}>
            <TouchableOpacity 
              style={styles.sectionHeader}
              onPress={() => toggle('Usuarios')}
              activeOpacity={0.7}
            >
              <Text style={styles.sectionHeaderText}>Usuarios</Text>
              <Feather 
                name={expanded['Usuarios'] ? "chevron-up" : "chevron-down"} 
                size={18} 
                color="#666" 
              />
            </TouchableOpacity>

            {expanded['Usuarios'] && (
              <View style={styles.subItemsContainer}>
                {config.sections.Usuarios.map((sub) => (
                  <Item key={sub.label} {...sub} indent={20} />
                ))}
              </View>
            )}
          </View>

          {/* Sección Ventas */}
          <View style={styles.sectionContainer}>
            <TouchableOpacity 
              style={styles.sectionHeader}
              onPress={() => toggle('Ventas')}
              activeOpacity={0.7}
            >
              <Text style={styles.sectionHeaderText}>Ventas</Text>
              <Feather 
                name={expanded['Ventas'] ? "chevron-up" : "chevron-down"} 
                size={18} 
                color="#666" 
              />
            </TouchableOpacity>

            {expanded['Ventas'] && (
              <View style={styles.subItemsContainer}>
                {config.sections.Ventas.map((sub) => (
                  <Item key={sub.label} {...sub} indent={20} />
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* ------------- Perfil Section ------------- */}
      <View style={styles.profileSection}>
        <Text style={styles.profileTitle}>Perfil</Text>
        
        <View style={styles.userInfo}>
          <View style={styles.userDetails}>
            <Text style={styles.username}>nybarber2025</Text>
            <Text style={styles.userEmail}>nybarber2025@gmail.com</Text>
            <Text style={styles.userRole}>Administrator</Text>
          </View>
        </View>

        {/* Botón Cerrar sesión */}
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
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
    backgroundColor: "#fff",
    borderRightWidth: 1,
    borderRightColor: "#e0e0e0"
  },
  scrollView: {
    flex: 1,
  },
  scrollContainer: { 
    flexGrow: 1 
  },
  header: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    alignItems: "center"
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center"
  },
  menuSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "#fff"
  },
  sectionContainer: {
    marginBottom: 0,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0"
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000"
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: "#fff"
  },
  menuText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
    marginLeft: 12
  },
  subItemsContainer: {
    backgroundColor: "#fff"
  },
  profileSection: {
    padding: 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0"
  },
  profileTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 16
  },
  userInfo: {
    marginBottom: 20
  },
  userDetails: {
    flex: 1
  },
  username: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4
  },
  userEmail: {
    color: "#666",
    fontSize: 14,
    marginBottom: 4
  },
  userRole: {
    color: "#666",
    fontSize: 14,
    fontStyle: "italic"
  },
  logoutButton: {
    backgroundColor: "#000",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center"
  },
  logoutText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600"
  }
});

export default CustomDrawer;