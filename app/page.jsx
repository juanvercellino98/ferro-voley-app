'use client';

import { useEffect, useState } from 'react';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const API_URL =
  'https://script.google.com/macros/s/AKfycbzbDuVT2zeGwzZlF3j1399q52vdrDXThYALNMOO1r8Ae_Lx-XNhm7Pew2xfHCwEaMCMrQ/exec';

export default function Home() {
  const [usuario, setUsuario] = useState(null);
  const [modoLogin, setModoLogin] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const esAdmin = usuario?.rol === 'ADMIN';
  const esPF = usuario?.rol === 'PF' || usuario?.rol === 'ADMIN';
  const esJugador = usuario?.rol === 'JUGADOR';
  const [tab, setTab] = useState('pf');
  const [seccionPF, setSeccionPF] = useState('dashboard');
  const [grupos, setGrupos] = useState([]);
  const [jugadores, setJugadores] = useState([]);
  const [rutinas, setRutinas] = useState([]);
  const [bancoEjercicios, setBancoEjercicios] = useState([]);
  const [bancoFiltro, setBancoFiltro] = useState({ bloque: '', zona: '', material: '' });
  const [bancoForm, setBancoForm] = useState({ ejercicio: '', bloque: '', objetivo: '', zona: '', material: '', videoUrl: '', observaciones: '' });
  const [bancoCargaMasiva, setBancoCargaMasiva] = useState('');
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioForm, setUsuarioForm] = useState({
    email: '',
    password: '',
    rol: 'PF',
    activo: 'SI',
    nombre: '',
  });
  const [planificacion, setPlanificacion] = useState([]);
  const [perfiles, setPerfiles] = useState([]);
  const [configApp, setConfigApp] = useState({
    appNombre: 'Ferro Vóley - Preparación Física App',
    subtitulo: 'Rutinas · Wellness · Asistencia · Seguimiento deportivo',
    logoUrl: '',
    colorPrincipal: '#a3e635',
  });
  const [wellness, setWellness] = useState([]);
  const [asistencia, setAsistencia] = useState([]);
  const [historialFisico, setHistorialFisico] = useState([]);
  const [medicionForm, setMedicionForm] = useState({
    fecha: new Date().toISOString().slice(0, 10),
    altura: '',
    peso: '',
    alcanceParado: '',
    alcanceSalto: '',
    salto: '',
    abalakov: '',
    observaciones: '',
  });
  const [detalleRutina, setDetalleRutina] = useState([]);
  const [rutinaAbierta, setRutinaAbierta] = useState(null);
  const [rutinaEditando, setRutinaEditando] = useState(null);
  const [ejerciciosEditando, setEjerciciosEditando] = useState([]);

  const [grupoSeleccionado, setGrupoSeleccionado] = useState('');
  const [grupoRutina, setGrupoRutina] = useState('');
  const [semanaPlanificacion, setSemanaPlanificacion] = useState('Semana 1');
  const [diaPlanificacion, setDiaPlanificacion] = useState('Lunes');
  const [fechaPlanificacion, setFechaPlanificacion] = useState('');
  const [rutinaPlanificacion, setRutinaPlanificacion] = useState('');
  const [filtroFecha, setFiltroFecha] = useState(() => new Date().toISOString().slice(0, 10));
  const [filtroSemana, setFiltroSemana] = useState('Semana 1');
  const [semanaDestinoCopiar, setSemanaDestinoCopiar] = useState('Semana 2');
  const [grupoJugador, setGrupoJugador] = useState('');
  const [jugadorSeleccionado, setJugadorSeleccionado] = useState('');
  const [jugadorPerfil, setJugadorPerfil] = useState('');
  const [perfilForm, setPerfilForm] = useState({
    fotoUrl: '',
    fechaNacimiento: '',
    alturaCm: '',
    pesoKg: '',
    alcanceParadoCm: '',
    alcanceSaltoCm: '',
    saltoCm: '',
    saltoAbalakovCm: '',
    manoDominante: '',
    observaciones: '',
  });
  const [ejercicios, setEjercicios] = useState([]);

  const [sueno, setSueno] = useState(5);
  const [fatiga, setFatiga] = useState(5);
  const [dolorMuscular, setDolorMuscular] = useState(5);
  const [estres, setEstres] = useState(5);
  const [motivacion, setMotivacion] = useState(5);

  useEffect(() => {
    const sesionGuardada = localStorage.getItem('ferroUsuario');
    if (sesionGuardada) {
      try {
        const usuarioParseado = JSON.parse(sesionGuardada);
        setUsuario(usuarioParseado);
        setTab(usuarioParseado.rol === 'JUGADOR' ? 'jugador' : 'pf');
      } catch (error) {
        localStorage.removeItem('ferroUsuario');
      }
    }

    cargarTodo();
  }, []);

  async function ingresarJugador() {
    const usuarioJugador = {
      email: 'jugadores@ferrovoley.com',
      nombre: 'Jugadores',
      rol: 'JUGADOR',
    };

    setUsuario(usuarioJugador);
    setTab('jugador');
    setLoginError('');
    localStorage.setItem('ferroUsuario', JSON.stringify(usuarioJugador));
  }

  async function ingresarPFAdmin(event) {
    event.preventDefault();
    setLoginError('');

    if (!loginEmail || !loginPassword) {
      setLoginError('Completá email y contraseña');
      return;
    }

    const res = await fetch(`${API_URL}?action=login&email=${encodeURIComponent(loginEmail)}&password=${encodeURIComponent(loginPassword)}`);
    const data = await res.json();

    if (!data.ok) {
      setLoginError(data.mensaje || 'Usuario o contraseña incorrectos');
      return;
    }

    if (data.usuario.rol === 'JUGADOR') {
      setLoginError('Esta pantalla es solo para PF/Admin');
      return;
    }

    setUsuario(data.usuario);
    setTab('pf');
    setSeccionPF('dashboard');
    localStorage.setItem('ferroUsuario', JSON.stringify(data.usuario));
  }

  function cerrarSesion() {
    localStorage.removeItem('ferroUsuario');
    setUsuario(null);
    setModoLogin('');
    setLoginEmail('');
    setLoginPassword('');
    setLoginError('');
    setTab('pf');
    setSeccionPF('dashboard');
  }

  async function cargarTodo() {
    cargarGrupos();
    cargarJugadores();
    cargarRutinas();
    cargarBancoEjercicios();
    cargarUsuarios();
    cargarPlanificacion();
    cargarPerfilesJugadores();
    cargarHistorialFisico();
    cargarConfigApp();
    cargarWellness();
    cargarAsistencia();
  }

  async function cargarGrupos() {
    const res = await fetch(`${API_URL}?action=listarGrupos`);
    const data = await res.json();
    if (data.ok) setGrupos(data.grupos || []);
  }

  async function cargarJugadores() {
    const res = await fetch(`${API_URL}?action=listarJugadores`);
    const data = await res.json();
    if (data.ok) setJugadores(data.jugadores || []);
  }

  async function cargarRutinas() {
    const res = await fetch(`${API_URL}?action=listarRutinas`);
    const data = await res.json();
    if (data.ok) setRutinas(data.rutinas || []);
  }

  async function cargarBancoEjercicios() {
    const res = await fetch(`${API_URL}?action=listarBancoEjercicios`);
    const data = await res.json();
    if (data.ok) setBancoEjercicios(data.ejercicios || []);
  }

  async function cargarUsuarios() {
    const res = await fetch(`${API_URL}?action=listarUsuarios`);
    const data = await res.json();
    if (data.ok) setUsuarios(data.usuarios || []);
  }

  async function cargarPlanificacion() {
    const res = await fetch(`${API_URL}?action=listarPlanificacion`);
    const data = await res.json();
    if (data.ok) setPlanificacion(data.planificacion || []);
  }

  async function cargarPerfilesJugadores() {
    const res = await fetch(`${API_URL}?action=listarPerfiles`);
    const data = await res.json();
    if (data.ok) setPerfiles(data.perfiles || []);
  }

  async function cargarHistorialFisico() {
    const res = await fetch(`${API_URL}?action=listarHistorialFisico`);
    const data = await res.json();
    if (data.ok) setHistorialFisico(data.historial || []);
  }

  async function cargarConfigApp() {
    const res = await fetch(`${API_URL}?action=listarConfigApp`);
    const data = await res.json();
    if (data.ok && data.config) {
      setConfigApp(prev => ({
        ...prev,
        ...data.config,
        appNombre: data.config.appNombre || data.config.nombreApp || prev.appNombre,
      }));
    }
  }

  async function cargarWellness() {
    const res = await fetch(`${API_URL}?action=listarWellness`);
    const data = await res.json();
    if (data.ok) setWellness(data.wellness || []);
  }

  async function cargarAsistencia() {
    const res = await fetch(`${API_URL}?action=listarAsistencia`);
    const data = await res.json();
    if (data.ok) setAsistencia(data.asistencia || []);
  }

  async function abrirRutina(rutina) {
    setRutinaAbierta(rutina);
    const res = await fetch(`${API_URL}?action=listarDetalleRutina&idRutina=${rutina.idRutina}`);
    const data = await res.json();
    if (data.ok) setDetalleRutina(data.detalle || []);
  }

  async function comenzarEdicionRutina(rutina) {
    setRutinaEditando({
      idRutina: rutina.idRutina,
      nombreRutina: rutina.nombreRutina || '',
      semana: rutina.semana || '',
      dia: rutina.dia || '',
      objetivo: rutina.objetivo || '',
    });

    const res = await fetch(`${API_URL}?action=listarDetalleRutina&idRutina=${rutina.idRutina}`);
    const data = await res.json();

    if (data.ok) {
      setEjerciciosEditando(
        (data.detalle || []).map((e) => ({
          bloque: e.bloque || '',
          nombre: e.ejercicio || '',
          series: e.series || '',
          reps: e.reps || '',
          kgSugerido: e.kgSugerido || '',
          rpe: e.rpe || '',
          tempo: e.tempo || '',
          videoUrl: e.videoUrl || '',
          observaciones: e.observaciones || '',
        }))
      );
    }
  }

  function actualizarEjercicioEditando(index, campo, valor) {
    setEjerciciosEditando((prev) =>
      prev.map((ejercicio, i) =>
        i === index ? { ...ejercicio, [campo]: valor } : ejercicio
      )
    );
  }

  function agregarEjercicioEditando() {
    setEjerciciosEditando((prev) => [
      ...prev,
      {
        bloque: '',
        nombre: '',
        series: '',
        reps: '',
        kgSugerido: '',
        rpe: '',
        tempo: '',
        videoUrl: '',
        observaciones: '',
      },
    ]);
  }

  function eliminarEjercicioEditando(index) {
    setEjerciciosEditando((prev) => prev.filter((_, i) => i !== index));
  }

  async function guardarEdicionRutina() {
    if (!rutinaEditando) return alert('No hay rutina para editar');

    if (!rutinaEditando.nombreRutina) {
      return alert('La rutina necesita un nombre');
    }

    if (ejerciciosEditando.length === 0) {
      return alert('La rutina necesita al menos un ejercicio');
    }

    await enviar({
      action: 'editarRutina',
      idRutina: rutinaEditando.idRutina,
      nombreRutina: rutinaEditando.nombreRutina,
      semana: rutinaEditando.semana,
      dia: rutinaEditando.dia,
      objetivo: rutinaEditando.objetivo,
      ejercicios: ejerciciosEditando,
    });

    alert('Rutina editada correctamente');

    setRutinaEditando(null);
    setEjerciciosEditando([]);

    setTimeout(() => {
      cargarRutinas();
      if (rutinaAbierta) abrirRutina(rutinaAbierta);
    }, 1000);
  }


  async function enviar(payload) {
    await fetch(API_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
    });
  }

  async function addGroup(event) {
    event.preventDefault();
    const form = new FormData(event.target);

    await enviar({
      action: 'crearGrupo',
      rama: form.get('rama'),
      tira: form.get('tira'),
      categoria: form.get('categoria'),
      pf: form.get('pf'),
    });

    alert('Grupo creado correctamente');
    event.target.reset();
    setTimeout(cargarGrupos, 1000);
  }

  async function addPlayer(event) {
    event.preventDefault();
    const form = new FormData(event.target);
    const grupo = grupos.find(g => String(g.id) === String(grupoSeleccionado));

    if (!grupo) return alert('Elegí un grupo');

    await enviar({
      action: 'crearJugador',
      nombre: form.get('nombre'),
      apellido: form.get('apellido'),
      posicion: form.get('posicion'),
      rama: grupo.rama,
      tira: grupo.tira,
      categoria: grupo.categoria,
    });

    alert('Jugador/a cargado correctamente');
    event.target.reset();
    setTimeout(cargarJugadores, 1000);
  }

  function addExercise(event) {
    event.preventDefault();
    const form = new FormData(event.target);

    setEjercicios(prev => [
      ...prev,
      {
        bloque: form.get('bloque'),
        nombre: form.get('ejercicio'),
        series: form.get('series'),
        reps: form.get('reps'),
        kgSugerido: form.get('kgSugerido'),
        rpe: form.get('rpe'),
        tempo: form.get('tempo'),
        videoUrl: form.get('videoUrl'),
        observaciones: form.get('observaciones'),
      },
    ]);

    event.target.reset();
  }

  async function saveRoutine() {
    const grupo = grupos.find(g => String(g.id) === String(grupoRutina));

    if (!grupo) return alert('Elegí un grupo');
    if (ejercicios.length === 0) return alert('Agregá al menos un ejercicio');

    await enviar({
      action: 'crearRutina',
      nombreRutina: document.getElementById('nombreRutina').value,
      semana: document.getElementById('semana').value,
      dia: document.getElementById('dia').value,
      objetivo: document.getElementById('objetivo').value,
      rama: grupo.rama,
      tira: grupo.tira,
      categoria: grupo.categoria,
      ejercicios,
    });

    alert('Rutina creada correctamente');
    setEjercicios([]);
    setTimeout(cargarRutinas, 1000);
  }

  async function guardarPlanificacionRutina() {
    const grupo = grupos.find(g => String(g.id) === String(grupoRutina));
    const rutina = rutinas.find(r => String(r.idRutina) === String(rutinaPlanificacion));

    if (!grupo) return alert('Elegí un grupo/categoría');
    if (!rutina) return alert('Elegí una rutina para planificar');

    await enviar({
      action: 'guardarPlanificacion',
      fecha: fechaPlanificacion,
      semana: semanaPlanificacion,
      dia: diaPlanificacion,
      idRutina: rutina.idRutina,
      nombreRutina: rutina.nombreRutina,
      rama: grupo.rama,
      tira: grupo.tira,
      categoria: grupo.categoria,
      observaciones: ''
    });

    alert('Rutina planificada correctamente');
    setTimeout(cargarPlanificacion, 1000);
  }


  async function duplicarRutina(rutina) {
    if (!rutina) return alert('Elegí una rutina para duplicar');

    const res = await fetch(`${API_URL}?action=listarDetalleRutina&idRutina=${rutina.idRutina}`);
    const data = await res.json();
    const detalle = data.ok ? data.detalle || [] : [];

    if (detalle.length === 0) {
      return alert('No se pudieron leer los ejercicios de esta rutina');
    }

    await enviar({
      action: 'crearRutina',
      nombreRutina: `${rutina.nombreRutina} - copia`,
      semana: rutina.semana,
      dia: rutina.dia,
      objetivo: rutina.objetivo || '',
      rama: rutina.rama,
      tira: rutina.tira,
      categoria: rutina.categoria,
      ejercicios: detalle.map((e) => ({
        bloque: e.bloque || '',
        nombre: e.ejercicio || '',
        series: e.series || '',
        reps: e.reps || '',
        kgSugerido: e.kgSugerido || '',
        rpe: e.rpe || '',
        tempo: e.tempo || '',
        videoUrl: e.videoUrl || '',
        observaciones: e.observaciones || '',
      })),
    });

    alert('Rutina duplicada correctamente');
    setTimeout(cargarRutinas, 1000);
  }

  async function copiarSemanaCompleta() {
    if (filtroSemana === semanaDestinoCopiar) {
      return alert('Elegí una semana destino distinta');
    }

    const items = planificacion.filter(
      (p) => String(p.semana) === String(filtroSemana)
    );

    if (items.length === 0) {
      return alert('No hay rutinas planificadas en la semana origen');
    }

    for (const item of items) {
      await enviar({
        action: 'guardarPlanificacion',
        fecha: '',
        semana: semanaDestinoCopiar,
        dia: item.dia,
        idRutina: item.idRutina,
        nombreRutina: item.nombreRutina,
        rama: item.rama,
        tira: item.tira,
        categoria: item.categoria,
        observaciones: item.observaciones || `Copiado desde ${filtroSemana}`,
      });
    }

    alert(`Semana copiada a ${semanaDestinoCopiar}`);
    setTimeout(cargarPlanificacion, 1000);
  }


  function cargarPerfilExistente(nombreJugador) {
    setJugadorPerfil(nombreJugador);

    const perfil = perfiles.find(p => p.jugador === nombreJugador);

    setPerfilForm({
      fotoUrl: perfil?.fotoUrl || '',
      fechaNacimiento: perfil?.fechaNacimiento ? fechaISO(perfil.fechaNacimiento) : '',
      alturaCm: perfil?.alturaCm || perfil?.altura || '',
      pesoKg: perfil?.pesoKg || perfil?.peso || '',
      alcanceParadoCm: perfil?.alcanceParadoCm || perfil?.alcanceParado || '',
      alcanceSaltoCm: perfil?.alcanceSaltoCm || perfil?.alcanceSalto || '',
      saltoCm: perfil?.saltoCm || perfil?.salto || '',
      saltoAbalakovCm: perfil?.saltoAbalakovCm || '',
      manoDominante: perfil?.manoDominante || '',
      observaciones: perfil?.observaciones || '',
    });
  }

  async function guardarPerfilJugador() {
    if (!jugadorPerfil) return alert('Elegí un jugador/a');

    await enviar({
      action: 'guardarPerfil',
      jugador: jugadorPerfil,
      fotoUrl: perfilForm.fotoUrl,
      altura: perfilForm.alturaCm,
      peso: perfilForm.pesoKg,
      alcanceParado: perfilForm.alcanceParadoCm,
      alcanceSalto: perfilForm.alcanceSaltoCm,
      salto: perfilForm.saltoCm,
      manoDominante: perfilForm.manoDominante,
      observaciones: perfilForm.observaciones,
    });

    alert('Perfil del jugador guardado correctamente');
    setTimeout(cargarPerfilesJugadores, 1000);
  }

  async function guardarMedicionFisica() {
    if (!jugadorPerfil) return alert('Elegí un jugador/a');

    await enviar({
      action: 'guardarMedicionFisica',
      jugador: jugadorPerfil,
      fecha: medicionForm.fecha,
      altura: medicionForm.altura,
      peso: medicionForm.peso,
      alcanceParado: medicionForm.alcanceParado,
      alcanceSalto: medicionForm.alcanceSalto,
      salto: medicionForm.salto,
      abalakov: medicionForm.abalakov,
      observaciones: medicionForm.observaciones,
    });

    alert('Medición física guardada en el historial');
    setTimeout(cargarHistorialFisico, 1000);
  }

  async function guardarConfigVisual() {
    await enviar({
      action: 'guardarConfigApp',
      ...configApp,
    });

    alert('Configuración visual guardada');
    setTimeout(cargarConfigApp, 1000);
  }

  async function guardarUsuario() {
    if (!usuarioForm.email || !usuarioForm.password || !usuarioForm.rol) {
      return alert('Completá email, contraseña y rol');
    }

    await enviar({
      action: 'crearUsuario',
      ...usuarioForm,
    });

    alert('Usuario creado correctamente');
    setUsuarioForm({
      email: '',
      password: '',
      rol: 'PF',
      activo: 'SI',
      nombre: '',
    });
    setTimeout(cargarUsuarios, 1000);
  }

  async function guardarEjercicioBanco() {
    if (!bancoForm.ejercicio) return alert('Escribí el nombre del ejercicio');

    await enviar({
      action: 'guardarEjercicioBanco',
      ...bancoForm,
      estado: 'ACTIVO',
    });

    alert('Ejercicio guardado en el banco');
    setBancoForm({ ejercicio: '', bloque: '', objetivo: '', zona: '', material: '', videoUrl: '', observaciones: '' });
    setTimeout(cargarBancoEjercicios, 1000);
  }

  async function cargarBateriaEjercicios() {
    const lineas = bancoCargaMasiva
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean);

    if (lineas.length === 0) {
      return alert('Pegá una lista de ejercicios. Formato sugerido: Ejercicio | Bloque | Objetivo | Zona | Material | Video | Observaciones');
    }

    const ejercicios = lineas.map((linea) => {
      const partes = linea.split('|').map(p => p.trim());
      return {
        ejercicio: partes[0] || '',
        bloque: partes[1] || '',
        objetivo: partes[2] || '',
        zona: partes[3] || '',
        material: partes[4] || '',
        videoUrl: partes[5] || '',
        observaciones: partes[6] || '',
        estado: 'ACTIVO',
      };
    }).filter(e => e.ejercicio);

    await enviar({
      action: 'cargarBancoEjercicios',
      ejercicios,
    });

    alert(`Se cargaron ${ejercicios.length} ejercicios al banco`);
    setBancoCargaMasiva('');
    setTimeout(cargarBancoEjercicios, 1000);
  }

  function agregarDesdeBancoARutina(ejercicioBanco) {
    setEjercicios(prev => [
      ...prev,
      {
        bloque: ejercicioBanco.bloque || '',
        nombre: ejercicioBanco.ejercicio || '',
        series: '',
        reps: '',
        kgSugerido: '',
        rpe: '',
        tempo: '',
        videoUrl: ejercicioBanco.videoUrl || '',
        observaciones: ejercicioBanco.observaciones || '',
      },
    ]);
  }

  function agregarDesdeBancoAEdicion(ejercicioBanco) {
    setEjerciciosEditando(prev => [
      ...prev,
      {
        bloque: ejercicioBanco.bloque || '',
        nombre: ejercicioBanco.ejercicio || '',
        series: '',
        reps: '',
        kgSugerido: '',
        rpe: '',
        tempo: '',
        videoUrl: ejercicioBanco.videoUrl || '',
        observaciones: ejercicioBanco.observaciones || '',
      },
    ]);
  }

  async function guardarWellness(event) {
    event.preventDefault();

    const form = new FormData(event.target);
    const grupo = grupos.find(g => String(g.id) === String(grupoJugador));

    if (!grupo) return alert('Elegí tu grupo');
    if (!jugadorSeleccionado) return alert('Elegí un jugador/a');

    await enviar({
      action: 'guardarWellness',
      rama: grupo.rama,
      tira: grupo.tira,
      categoria: grupo.categoria,
      jugador: jugadorSeleccionado,
      sueno,
      fatiga,
      dolorMuscular,
      estres,
      motivacion,
      comentarios: form.get('comentarios'),
    });

    alert('Wellness guardado correctamente');
    event.target.reset();
    setJugadorSeleccionado('');
    setTimeout(cargarWellness, 1000);
  }

  async function guardarAsistencia(event) {
    event.preventDefault();

    const form = new FormData(event.target);
    const grupo = grupos.find(g => String(g.id) === String(grupoJugador));

    if (!grupo) return alert('Elegí tu grupo');
    if (!jugadorSeleccionado) return alert('Elegí un jugador/a');

    await enviar({
      action: 'guardarAsistencia',
      rama: grupo.rama,
      tira: grupo.tira,
      categoria: grupo.categoria,
      jugador: jugadorSeleccionado,
      estado: form.get('estado'),
      observaciones: form.get('observaciones'),
    });

    alert('Asistencia guardada correctamente');
    event.target.reset();
    setJugadorSeleccionado('');
    setTimeout(cargarAsistencia, 1000);
  }

  const grupoActualJugador = grupos.find(g => String(g.id) === String(grupoJugador));

  const jugadoresDelGrupo = jugadores.filter((j) => {
    if (!grupoActualJugador) return false;

    return (
      j.rama === grupoActualJugador.rama &&
      j.tira === grupoActualJugador.tira &&
      j.categoria === grupoActualJugador.categoria
    );
  });

  const perfilJugadorSeleccionado = perfiles.find(p => p.jugador === jugadorSeleccionado);
  const historialJugadorSeleccionado = historialFisico
    .filter(h => h.jugador === jugadorSeleccionado)
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  const historialJugadorPerfil = historialFisico
    .filter(h => h.jugador === jugadorPerfil)
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

  const wellnessJugador = wellness.filter(w => w.jugador === jugadorSeleccionado);
  const asistenciaJugador = asistencia.filter(a => a.jugador === jugadorSeleccionado);

  const wellnessGrafico = wellnessJugador.slice(-7).map((w, index) => ({
    dia: index + 1,
    fatiga: Number(w.fatiga || 0),
    sueno: Number(w.sueno || 0),
    motivacion: Number(w.motivacion || 0),
  }));

  const fatigaPromedio = (
    wellnessJugador.reduce((acc, w) => acc + Number(w.fatiga || 0), 0) /
    Math.max(wellnessJugador.length, 1)
  ).toFixed(1);

  const suenoPromedio = (
    wellnessJugador.reduce((acc, w) => acc + Number(w.sueno || 0), 0) /
    Math.max(wellnessJugador.length, 1)
  ).toFixed(1);

  const alertasPersonales = wellnessJugador.filter(
    w => Number(w.fatiga) >= 8 || Number(w.dolorMuscular) >= 8 || Number(w.sueno) <= 4
  );

  const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  function fechaISO(valor) {
    if (!valor) return '';
    return new Date(valor).toISOString().slice(0, 10);
  }

  const wellnessHoy = wellness.filter(w => fechaISO(w.fecha) === filtroFecha);
  const asistenciaHoy = asistencia.filter(a => fechaISO(a.fecha) === filtroFecha);

  const planificacionFiltrada = planificacion.filter(p =>
    String(p.semana) === String(filtroSemana)
  );

  const planificacionJugadorSemana = planificacionFiltrada.filter((p) => {
    if (!grupoActualJugador) return false;
    return (
      p.rama === grupoActualJugador.rama &&
      p.tira === grupoActualJugador.tira &&
      p.categoria === grupoActualJugador.categoria
    );
  });

  const alertasWellness = wellnessHoy.filter(
    w => Number(w.fatiga) >= 8 || Number(w.dolorMuscular) >= 8 || Number(w.sueno) <= 4
  );

  const alertasCriticas = wellnessHoy.filter(w => Number(w.fatiga) >= 8 || Number(w.dolorMuscular) >= 8 || Number(w.sueno) <= 4 || Number(w.estres) >= 8);
  const rankingFatigaHoy = [...wellnessHoy]
    .sort((a, b) => Number(b.fatiga || 0) - Number(a.fatiga || 0))
    .slice(0, 5);
  const jugadoresSinWellnessHoy = jugadores.filter(j => !wellnessHoy.some(w => w.jugador === j.nombreCompleto));

  const presentes = asistenciaHoy.filter(a => a.estado === 'PRESENTE').length;
  const ausentes = asistenciaHoy.filter(a => a.estado === 'AUSENTE').length;
  const lesionados = asistenciaHoy.filter(a => a.estado === 'LESIONADO').length;
  const adaptados = asistenciaHoy.filter(a => a.estado === 'ADAPTADO').length;

  const rutinasJugador = rutinas.filter((r) => {
    if (!grupoActualJugador) return false;

    return (
      r.rama === grupoActualJugador.rama &&
      r.tira === grupoActualJugador.tira &&
      r.categoria === grupoActualJugador.categoria
    );
  });

  const bancoEjerciciosFiltrado = bancoEjercicios.filter((e) => {
    const coincideBloque = !bancoFiltro.bloque || String(e.bloque || '').toLowerCase().includes(bancoFiltro.bloque.toLowerCase());
    const coincideZona = !bancoFiltro.zona || String(e.zona || '').toLowerCase().includes(bancoFiltro.zona.toLowerCase());
    const coincideMaterial = !bancoFiltro.material || String(e.material || '').toLowerCase().includes(bancoFiltro.material.toLowerCase());
    return coincideBloque && coincideZona && coincideMaterial;
  });

  const readinessScore = jugadorSeleccionado ? Math.max(0, Math.min(100, Math.round(
    (Number(sueno) * 10 * 0.25) +
    ((10 - Number(fatiga)) * 10 * 0.25) +
    ((10 - Number(dolorMuscular)) * 10 * 0.20) +
    ((10 - Number(estres)) * 10 * 0.15) +
    (Number(motivacion) * 10 * 0.15)
  ))) : 0;


  function estiloBloque(bloque) {
    const texto = String(bloque || '').toLowerCase();

    if (texto.includes('activ')) return { borderLeft: '6px solid #22c55e', background: 'rgba(34,197,94,0.08)' };
    if (texto.includes('bloque 1') || texto.includes('b1')) return { borderLeft: '6px solid #3b82f6', background: 'rgba(59,130,246,0.08)' };
    if (texto.includes('bloque 2') || texto.includes('b2')) return { borderLeft: '6px solid #f97316', background: 'rgba(249,115,22,0.08)' };
    if (texto.includes('pot')) return { borderLeft: '6px solid #a855f7', background: 'rgba(168,85,247,0.08)' };
    if (texto.includes('prev')) return { borderLeft: '6px solid #ef4444', background: 'rgba(239,68,68,0.08)' };
    if (texto.includes('vuelta') || texto.includes('calma')) return { borderLeft: '6px solid #14b8a6', background: 'rgba(20,184,166,0.08)' };
    if (texto.includes('fuerza')) return { borderLeft: '6px solid #eab308', background: 'rgba(234,179,8,0.08)' };

    return { borderLeft: '6px solid #a3e635', background: 'rgba(163,230,53,0.06)' };
  }

  function BloqueTag({ bloque }) {
    return (
      <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-black text-lime-300 mb-2">
        {bloque || 'Bloque'}
      </span>
    );
  }

  async function exportarRutinaPDF(rutina) {
    const res = await fetch(`${API_URL}?action=listarDetalleRutina&idRutina=${rutina.idRutina}`);
    const data = await res.json();
    const ejerciciosPDF = data.ok ? data.detalle || [] : [];

    const htmlEjercicios = ejerciciosPDF.map((e) => {
      const bloque = e.bloque || 'Bloque';
      return `
        <div class="ejercicio">
          <div class="bloque">${bloque}</div>
          <h3>${e.orden}. ${e.ejercicio || ''}</h3>
          <p><strong>Series:</strong> ${e.series || '-'} · <strong>Reps:</strong> ${e.reps || '-'} · <strong>Kg:</strong> ${e.kgSugerido || '-'}</p>
          <p><strong>RPE:</strong> ${e.rpe || '-'} · <strong>Tempo:</strong> ${e.tempo || '-'}</p>
          ${e.observaciones ? `<p><strong>Obs:</strong> ${e.observaciones}</p>` : ''}
        </div>
      `;
    }).join('');

    const ventana = window.open('', '_blank');

    ventana.document.write(`
      <html>
        <head>
          <title>${rutina.nombreRutina}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 32px; color: #111; }
            .header { border-bottom: 3px solid #111; padding-bottom: 16px; margin-bottom: 24px; }
            h1 { margin: 0; font-size: 28px; }
            .meta { color: #555; margin-top: 8px; }
            .ejercicio { border-left: 8px solid #84cc16; background: #f4f4f5; padding: 16px; margin-bottom: 14px; border-radius: 12px; page-break-inside: avoid; }
            .bloque { display: inline-block; background: #111; color: white; padding: 6px 10px; border-radius: 999px; font-size: 12px; font-weight: bold; margin-bottom: 8px; }
            h3 { margin: 6px 0 8px; }
            p { margin: 5px 0; }
            .footer { margin-top: 30px; color: #666; font-size: 12px; }
            @media print { button { display:none; } }
          </style>
        </head>
        <body>
          <button onclick="window.print()" style="padding:12px 18px; border-radius:10px; border:0; background:#84cc16; font-weight:bold; margin-bottom:20px; cursor:pointer;">Guardar / Imprimir PDF</button>
          <div class="header">
            <h1>${rutina.nombreRutina}</h1>
            <div class="meta">Semana ${rutina.semana || '-'} · ${rutina.dia || '-'} · ${rutina.rama || ''} ${rutina.categoria || ''}</div>
          </div>
          ${htmlEjercicios}
          <div class="footer">Ferro Vóley · Preparación Física</div>
        </body>
      </html>
    `);

    ventana.document.close();
  }

  function Slider({ label, value, setValue }) {
    return (
      <div className="premium-card">
        <div className="flex justify-between">
          <p className="font-bold">{label}</p>
          <p className="text-lime-400 font-black">{value}/10</p>
        </div>
        <input
          type="range"
          min="1"
          max="10"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full mt-4 accent-lime-400"
        />
      </div>
    );
  }

  function Stat({ label, value, tone = 'green' }) {
    return (
      <div className="premium-card">
        <p className={`text-3xl font-black ${tone === 'red' ? 'text-red-400' : tone === 'yellow' ? 'text-yellow-400' : tone === 'blue' ? 'text-cyan-400' : 'text-lime-400'}`}>
          {value}
        </p>
        <p className="text-sm text-zinc-400 mt-1">{label}</p>
      </div>
    );
  }

  function NavButton({ id, label }) {
    return (
      <button
        onClick={() => setSeccionPF(id)}
        className={`nav-btn ${seccionPF === id ? 'nav-active' : ''}`}
      >
        {label}
      </button>
    );
  }


  if (!usuario) {
    return (
      <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-4">
        <div className="w-full max-w-xl rounded-[2rem] bg-[#111113] border border-white/10 p-6 shadow-2xl">
          <div className="text-center">
            <p className="text-lime-400 text-xs tracking-[0.35em] uppercase font-black">
              Ferro Vóley
            </p>
            <h1 className="text-3xl md:text-5xl font-black mt-3">
              Preparación Física
            </h1>
            <p className="text-zinc-400 mt-3">
              Ingresá según tu rol para acceder a la plataforma.
            </p>
          </div>

          {!modoLogin && (
            <div className="grid gap-3 mt-8">
              <button
                onClick={ingresarJugador}
                className="rounded-2xl bg-lime-400 text-black p-5 font-black text-lg"
              >
                🏐 Entrar como jugador/a
              </button>

              <button
                onClick={() => setModoLogin('pf')}
                className="rounded-2xl bg-white text-black p-5 font-black text-lg"
              >
                🧑‍🏫 Entrar como PF / Admin
              </button>
            </div>
          )}

          {modoLogin === 'pf' && (
            <form onSubmit={ingresarPFAdmin} className="mt-8 space-y-4">
              <div>
                <p className="text-sm text-zinc-400 mb-2">Email</p>
                <input
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="admin@ferrovoley.com"
                  className="w-full rounded-2xl bg-zinc-800 border border-white/10 p-4 text-white outline-none"
                />
              </div>

              <div>
                <p className="text-sm text-zinc-400 mb-2">Contraseña</p>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Contraseña"
                  className="w-full rounded-2xl bg-zinc-800 border border-white/10 p-4 text-white outline-none"
                />
              </div>

              {loginError && (
                <div className="rounded-2xl bg-red-500/15 border border-red-500/30 p-4 text-red-300 text-sm font-bold">
                  {loginError}
                </div>
              )}

              <button className="w-full rounded-2xl bg-lime-400 text-black p-4 font-black">
                Ingresar
              </button>

              <button
                type="button"
                onClick={() => {
                  setModoLogin('');
                  setLoginError('');
                }}
                className="w-full rounded-2xl bg-zinc-800 text-white p-4 font-black"
              >
                Volver
              </button>

              <div className="rounded-2xl bg-black/30 p-4 text-xs text-zinc-400">
                Usuarios iniciales: admin@ferrovoley.com / admin123 · pf@ferrovoley.com / pf123
              </div>
            </form>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="mx-auto max-w-6xl p-4 md:p-6">
        <header className="hero">
          <div>
            <div className="flex items-center gap-3">
              {configApp.logoUrl && (
                <img src={configApp.logoUrl} alt="Logo" className="h-12 w-12 rounded-2xl object-cover bg-white" />
              )}
              <p className="text-lime-400 text-xs tracking-[0.35em] uppercase font-bold">
                Ferro Vóley
              </p>
            </div>
            <h1 className="text-3xl md:text-5xl font-black mt-2 leading-tight">
              {configApp.appNombre || 'Preparación Física App'}
            </h1>
            <p className="text-zinc-400 mt-2">
              {configApp.subtitulo || 'Rutinas · Wellness · Asistencia · Seguimiento deportivo'}
            </p>
          </div>

          <div className="flex flex-col md:items-end gap-3 mt-5 md:mt-0">
            <div className="rounded-2xl bg-black/30 border border-white/10 px-4 py-3 text-sm">
              <p className="font-black">{usuario.nombre}</p>
              <p className="text-zinc-400">{usuario.rol}</p>
            </div>

            <div className="flex gap-2">
              {esJugador && (
                <button
                  onClick={() => setTab('jugador')}
                  className={`top-tab ${tab === 'jugador' ? 'top-tab-active' : ''}`}
                >
                  Jugador/a
                </button>
              )}

              {esPF && (
                <>
                  <button
                    onClick={() => setTab('jugador')}
                    className={`top-tab ${tab === 'jugador' ? 'top-tab-active' : ''}`}
                  >
                    Vista jugador
                  </button>

                  <button
                    onClick={() => setTab('pf')}
                    className={`top-tab ${tab === 'pf' ? 'top-tab-active' : ''}`}
                  >
                    PF/Admin
                  </button>
                </>
              )}

              <button
                onClick={cerrarSesion}
                className="top-tab"
              >
                Salir
              </button>
            </div>
          </div>
        </header>

        {esPF && tab === 'pf' && (
          <div className="grid grid-cols-1 md:grid-cols-[230px_1fr] gap-5 mt-5">
            <aside className="sidebar">
              <NavButton id="dashboard" label="Dashboard" />
              <NavButton id="calendario" label="Calendario" />
              <NavButton id="rutinas" label="Rutinas" />
              <NavButton id="grupo" label="Crear grupo" />
              <NavButton id="jugador" label="Cargar jugador" />
              <NavButton id="perfilJugador" label="Perfil jugador" />
              <NavButton id="crearRutina" label="Crear rutina" />
              <NavButton id="bancoEjercicios" label="Banco ejercicios" />
              {esAdmin && <NavButton id="usuarios" label="Usuarios" />}
              {esAdmin && <NavButton id="adminVisual" label="Personalizar app" />}
            </aside>

            <section className="space-y-6">
              {seccionPF === 'dashboard' && (
                <>
                  <div>
                    <h2 className="section-title">Dashboard PF</h2>
                    <p className="section-subtitle">
                      Vista diaria. Por defecto muestra solo lo cargado en la fecha seleccionada.
                    </p>
                  </div>

                  <div className="premium-card">
                    <div className="grid md:grid-cols-3 gap-3">
                      <div>
                        <p className="text-sm text-zinc-400 mb-2">Fecha de control</p>
                        <input
                          type="date"
                          value={filtroFecha}
                          onChange={(e) => setFiltroFecha(e.target.value)}
                          className="input"
                        />
                      </div>

                      <div>
                        <p className="text-sm text-zinc-400 mb-2">Semana / microciclo</p>
                        <select
                          value={filtroSemana}
                          onChange={(e) => setFiltroSemana(e.target.value)}
                          className="input"
                        >
                          <option>Semana 1</option>
                          <option>Semana 2</option>
                          <option>Semana 3</option>
                          <option>Semana 4</option>
                          <option>Semana 5</option>
                          <option>Semana 6</option>
                          <option>Semana 7</option>
                          <option>Semana 8</option>
                        </select>
                      </div>

                      <div className="flex items-end">
                        <button
                          onClick={cargarTodo}
                          className="btn-green"
                        >
                          Actualizar datos
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <Stat label="Wellness del día" value={wellnessHoy.length} />
                    <Stat label="Alertas del día" value={alertasWellness.length} tone="red" />
                    <Stat label="Presentes del día" value={presentes} />
                    <Stat label="Adaptados/lesionados" value={adaptados + lesionados} tone="yellow" />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="premium-card">
                      <h3 className="font-black text-red-300">Alertas críticas</h3>
                      <p className="text-xs text-zinc-500 mt-1">Fatiga alta, dolor alto, poco sueño o estrés elevado.</p>
                      <div className="mt-4 space-y-2">
                        {alertasCriticas.slice(0, 6).map((w) => (
                          <div key={w.id} className="rounded-2xl bg-red-500/10 border border-red-500/20 p-3">
                            <p className="font-black">{w.jugador}</p>
                            <p className="text-xs text-zinc-300 mt-1">Sueño {w.sueno}/10 · Fatiga {w.fatiga}/10 · Dolor {w.dolorMuscular}/10 · Estrés {w.estres}/10</p>
                          </div>
                        ))}
                        {alertasCriticas.length === 0 && <p className="text-sm text-zinc-500">Sin alertas críticas hoy.</p>}
                      </div>
                    </div>

                    <div className="premium-card">
                      <h3 className="font-black text-yellow-300">Ranking fatiga</h3>
                      <p className="text-xs text-zinc-500 mt-1">Top 5 de fatiga reportada hoy.</p>
                      <div className="mt-4 space-y-2">
                        {rankingFatigaHoy.map((w, index) => (
                          <div key={w.id} className="flex items-center justify-between rounded-2xl bg-black/30 p-3">
                            <p className="font-bold text-sm">{index + 1}. {w.jugador}</p>
                            <p className="font-black text-yellow-300">{w.fatiga}/10</p>
                          </div>
                        ))}
                        {rankingFatigaHoy.length === 0 && <p className="text-sm text-zinc-500">Todavía no hay wellness cargado hoy.</p>}
                      </div>
                    </div>

                    <div className="premium-card">
                      <h3 className="font-black text-cyan-300">Pendientes wellness</h3>
                      <p className="text-xs text-zinc-500 mt-1">Jugadores que todavía no cargaron wellness hoy.</p>
                      <p className="text-4xl font-black mt-4 text-cyan-300">{jugadoresSinWellnessHoy.length}</p>
                      <p className="text-sm text-zinc-400 mt-2">Sobre {jugadores.length} jugadores cargados.</p>
                    </div>
                  </div>

                  <div className="premium-card">
                    <h3 className="font-black">Planificación de {filtroSemana}</h3>
                    <p className="text-zinc-400 text-sm mt-1">
                      Rutinas asignadas por día. No duplica rutinas: reutiliza las ya creadas.
                    </p>

                    <div className="grid md:grid-cols-7 gap-3 mt-5">
                      {diasSemana.map((dia) => (
                        <div
                          key={dia}
                          className="rounded-2xl bg-zinc-900 p-3 border border-white/5 min-h-32"
                        >
                          <p className="font-black text-lime-400">{dia}</p>

                          <div className="mt-3 space-y-2">
                            {planificacionFiltrada
                              .filter(p => p.dia === dia)
                              .map((p) => (
                                <button
                                  key={p.id}
                                  onClick={() => {
                                    const rutina = rutinas.find(r => String(r.idRutina) === String(p.idRutina));
                                    if (rutina) abrirRutina(rutina);
                                  }}
                                  className="w-full rounded-xl bg-black/40 p-2 text-left border border-white/5"
                                >
                                  <p className="text-sm font-bold">{p.nombreRutina}</p>
                                  <p className="text-xs text-zinc-400 mt-1">{p.categoria}</p>
                                  {p.fecha && (
                                    <p className="text-xs text-zinc-500">{fechaISO(p.fecha)}</p>
                                  )}
                                </button>
                              ))}

                            {planificacionFiltrada.filter(p => p.dia === dia).length === 0 && (
                              <p className="text-xs text-zinc-600 mt-2">Sin rutina</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {alertasWellness.length > 0 && (
                    <div className="alert-box">
                      <h3 className="font-black text-red-300">Alertas wellness del día</h3>
                      <div className="mt-3 grid gap-3">
                        {alertasWellness.map((w) => (
                          <div key={w.id} className="rounded-2xl bg-black/40 p-4 border border-red-500/10">
                            <p className="font-black">{w.jugador}</p>
                            <p className="text-sm text-zinc-300 mt-1">
                              Sueño {w.sueno}/10 · Fatiga {w.fatiga}/10 · Dolor {w.dolorMuscular}/10
                            </p>
                            {w.comentarios && (
                              <p className="text-sm text-zinc-400 mt-1">Obs: {w.comentarios}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="premium-card">
                    <h3 className="font-black">Asistencia del día</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 text-sm">
                      <p>✅ Presentes: {presentes}</p>
                      <p>❌ Ausentes: {ausentes}</p>
                      <p>🟡 Adaptados: {adaptados}</p>
                      <p>🔴 Lesionados: {lesionados}</p>
                    </div>
                  </div>
                </>
              )}

              {seccionPF === 'calendario' && (
                <>
                  <div>
                    <h2 className="section-title">Calendario semanal</h2>
                    <p className="section-subtitle">
                      Asigná rutinas existentes a semanas, días, fechas y categorías.
                    </p>
                  </div>

                  <FormCard title="Planificar rutina">
                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <p className="text-sm text-zinc-400 mb-2">Grupo / categoría</p>
                        <select
                          value={grupoRutina}
                          onChange={(e) => setGrupoRutina(e.target.value)}
                          className="input"
                        >
                          <option value="">Elegir grupo</option>
                          {grupos.map((g) => (
                            <option key={g.id} value={g.id}>
                              {g.rama} · {g.tira} · {g.categoria}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <p className="text-sm text-zinc-400 mb-2">Rutina existente</p>
                        <select
                          value={rutinaPlanificacion}
                          onChange={(e) => setRutinaPlanificacion(e.target.value)}
                          className="input"
                        >
                          <option value="">Elegir rutina</option>
                          {rutinas.map((r) => (
                            <option key={r.idRutina} value={r.idRutina}>
                              {r.nombreRutina}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <p className="text-sm text-zinc-400 mb-2">Semana / microciclo</p>
                        <select
                          value={semanaPlanificacion}
                          onChange={(e) => setSemanaPlanificacion(e.target.value)}
                          className="input"
                        >
                          <option>Semana 1</option>
                          <option>Semana 2</option>
                          <option>Semana 3</option>
                          <option>Semana 4</option>
                          <option>Semana 5</option>
                          <option>Semana 6</option>
                          <option>Semana 7</option>
                          <option>Semana 8</option>
                        </select>
                      </div>

                      <div>
                        <p className="text-sm text-zinc-400 mb-2">Día</p>
                        <select
                          value={diaPlanificacion}
                          onChange={(e) => setDiaPlanificacion(e.target.value)}
                          className="input"
                        >
                          {diasSemana.map(dia => (
                            <option key={dia}>{dia}</option>
                          ))}
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <p className="text-sm text-zinc-400 mb-2">Fecha exacta opcional</p>
                        <input
                          type="date"
                          value={fechaPlanificacion}
                          onChange={(e) => setFechaPlanificacion(e.target.value)}
                          className="input"
                        />
                      </div>
                    </div>

                    <button
                      onClick={guardarPlanificacionRutina}
                      className="btn-green mt-4"
                    >
                      Guardar planificación
                    </button>
                  </FormCard>

                  <div className="premium-card">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div>
                        <h3 className="font-black text-xl">Vista semanal</h3>
                        <p className="text-zinc-400 text-sm mt-1">
                          Rutinas planificadas por semana y día.
                        </p>
                      </div>

                      <select
                        value={filtroSemana}
                        onChange={(e) => setFiltroSemana(e.target.value)}
                        className="input md:max-w-xs"
                      >
                        <option>Semana 1</option>
                        <option>Semana 2</option>
                        <option>Semana 3</option>
                        <option>Semana 4</option>
                        <option>Semana 5</option>
                        <option>Semana 6</option>
                        <option>Semana 7</option>
                        <option>Semana 8</option>
                      </select>
                    </div>

                    <div className="mt-5 rounded-3xl bg-zinc-950/60 p-4 border border-white/5">
                      <h4 className="font-black text-lg">Copiar semana completa</h4>
                      <p className="text-sm text-zinc-400 mt-1">
                        Copia todas las rutinas de {filtroSemana} hacia otra semana para reutilizar la planificación.
                      </p>
                      <div className="grid md:grid-cols-[1fr_auto] gap-3 mt-4">
                        <select
                          value={semanaDestinoCopiar}
                          onChange={(e) => setSemanaDestinoCopiar(e.target.value)}
                          className="input"
                        >
                          <option>Semana 1</option>
                          <option>Semana 2</option>
                          <option>Semana 3</option>
                          <option>Semana 4</option>
                          <option>Semana 5</option>
                          <option>Semana 6</option>
                          <option>Semana 7</option>
                          <option>Semana 8</option>
                        </select>
                        <button
                          onClick={copiarSemanaCompleta}
                          className="rounded-2xl bg-white text-black px-5 py-3 font-black"
                        >
                          Copiar semana
                        </button>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-7 gap-3 mt-5">
                      {diasSemana.map((dia) => (
                        <div
                          key={dia}
                          className="rounded-2xl bg-zinc-900 p-3 border border-white/5 min-h-40"
                        >
                          <p className="font-black text-lime-400">{dia}</p>

                          <div className="mt-3 space-y-2">
                            {planificacionFiltrada
                              .filter(p => p.dia === dia)
                              .map((p) => (
                                <div
                                  key={p.id}
                                  className="rounded-xl bg-black/40 p-2 border border-white/5"
                                >
                                  <p className="text-sm font-bold">{p.nombreRutina}</p>
                                  <p className="text-xs text-zinc-400 mt-1">
                                    {p.rama} · {p.categoria}
                                  </p>
                                  {p.fecha && (
                                    <p className="text-xs text-zinc-500">{fechaISO(p.fecha)}</p>
                                  )}
                                </div>
                              ))}

                            {planificacionFiltrada.filter(p => p.dia === dia).length === 0 && (
                              <p className="text-xs text-zinc-600 mt-2">Sin rutina asignada</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {seccionPF === 'rutinas' && (
                <>
                  <div>
                    <h2 className="section-title">Rutinas creadas</h2>
                    <p className="section-subtitle">Abrí una rutina para ver sus ejercicios.</p>
                  </div>

                  <div className="grid gap-3">
                    {rutinas.map((r) => (
                      <div key={r.idRutina} className="routine-card">
                        <button onClick={() => abrirRutina(r)} className="w-full text-left">
                          <p className="font-black text-lime-400">{r.nombreRutina}</p>
                          <p className="text-sm text-zinc-300 mt-1">
                            {r.rama} · {r.tira} · {r.categoria}
                          </p>
                          <p className="text-sm text-zinc-400">
                            Semana {r.semana} · {r.dia}
                          </p>
                        </button>

                        <div className="flex flex-wrap gap-2 mt-4">
                          <button
                            onClick={() => abrirRutina(r)}
                            className="rounded-xl bg-lime-400 text-black px-3 py-2 text-sm font-black"
                          >
                            Abrir
                          </button>
                          <button
                            onClick={() => duplicarRutina(r)}
                            className="rounded-xl bg-zinc-700 text-white px-3 py-2 text-sm font-black"
                          >
                            Duplicar
                          </button>
                          <button
                            onClick={() => exportarRutinaPDF(r)}
                            className="rounded-xl bg-white text-black px-3 py-2 text-sm font-black"
                          >
                            PDF
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {rutinaAbierta && (
                    <div className="premium-card">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                        <div>
                          <h3 className="text-2xl font-black text-lime-400">{rutinaAbierta.nombreRutina}</h3>
                          <p className="text-sm text-zinc-400 mt-1">
                            Semana {rutinaAbierta.semana} · {rutinaAbierta.dia}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => exportarRutinaPDF(rutinaAbierta)}
                            className="rounded-2xl bg-lime-400 text-black px-4 py-3 font-black"
                          >
                            Descargar PDF
                          </button>
                          <button
                            onClick={() => duplicarRutina(rutinaAbierta)}
                            className="rounded-2xl bg-zinc-800 text-white px-4 py-3 font-black border border-white/10"
                          >
                            Duplicar
                          </button>
                          <button
                            onClick={() => comenzarEdicionRutina(rutinaAbierta)}
                            className="rounded-2xl bg-white text-black px-4 py-3 font-black"
                          >
                            Editar rutina
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3">
                        {detalleRutina.map((e) => (
                          <div key={e.idDetalle} className="exercise-card" style={estiloBloque(e.bloque)}>
                            <BloqueTag bloque={e.bloque} />
                            <p className="font-black">{e.orden}. {e.ejercicio}</p>
                            <p className="text-sm text-zinc-300">
                              {e.bloque} · {e.series} series · {e.reps} reps
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {rutinaEditando && (
                    <div className="premium-card border border-lime-400/30">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                        <div>
                          <h3 className="text-2xl font-black text-lime-400">Editar rutina</h3>
                          <p className="text-zinc-400 text-sm mt-1">
                            Modificá los datos y ejercicios de la rutina seleccionada.
                          </p>
                        </div>

                        <button
                          onClick={() => {
                            setRutinaEditando(null);
                            setEjerciciosEditando([]);
                          }}
                          className="rounded-2xl bg-zinc-800 text-white px-4 py-3 font-black"
                        >
                          Cancelar
                        </button>
                      </div>

                      <div className="grid md:grid-cols-2 gap-3 mt-5">
                        <input
                          value={rutinaEditando.nombreRutina}
                          onChange={(e) =>
                            setRutinaEditando({ ...rutinaEditando, nombreRutina: e.target.value })
                          }
                          placeholder="Nombre de rutina"
                          className="input"
                        />

                        <input
                          value={rutinaEditando.semana}
                          onChange={(e) =>
                            setRutinaEditando({ ...rutinaEditando, semana: e.target.value })
                          }
                          placeholder="Semana / Microciclo"
                          className="input"
                        />

                        <input
                          value={rutinaEditando.dia}
                          onChange={(e) =>
                            setRutinaEditando({ ...rutinaEditando, dia: e.target.value })
                          }
                          placeholder="Día"
                          className="input"
                        />

                        <input
                          value={rutinaEditando.objetivo}
                          onChange={(e) =>
                            setRutinaEditando({ ...rutinaEditando, objetivo: e.target.value })
                          }
                          placeholder="Objetivo"
                          className="input"
                        />
                      </div>

                      <div className="mt-6 space-y-4">
                        <div className="flex items-center justify-between gap-3">
                          <h4 className="font-black text-xl">Ejercicios</h4>

                          <button
                            onClick={agregarEjercicioEditando}
                            className="rounded-2xl bg-lime-400 text-black px-4 py-3 font-black"
                          >
                            + Agregar ejercicio
                          </button>
                        </div>

                        <div className="rounded-3xl bg-zinc-950/60 p-4 border border-white/5">
                          <h4 className="font-black text-lg">Agregar desde banco</h4>
                          <div className="grid md:grid-cols-3 gap-3 mt-3">
                            <input value={bancoFiltro.bloque} onChange={(e) => setBancoFiltro({ ...bancoFiltro, bloque: e.target.value })} placeholder="Filtro bloque" className="input-dark" />
                            <input value={bancoFiltro.zona} onChange={(e) => setBancoFiltro({ ...bancoFiltro, zona: e.target.value })} placeholder="Filtro zona" className="input-dark" />
                            <input value={bancoFiltro.material} onChange={(e) => setBancoFiltro({ ...bancoFiltro, material: e.target.value })} placeholder="Filtro material" className="input-dark" />
                          </div>
                          <div className="grid md:grid-cols-2 gap-2 mt-4 max-h-72 overflow-y-auto pr-1">
                            {bancoEjerciciosFiltrado.slice(0, 20).map((e) => (
                              <button key={e.id} type="button" onClick={() => agregarDesdeBancoAEdicion(e)} className="rounded-2xl bg-black/40 p-3 text-left border border-white/5 hover:border-lime-400/60">
                                <p className="font-black text-lime-300">+ {e.ejercicio}</p>
                                <p className="text-xs text-zinc-400 mt-1">{e.bloque || '-'} · {e.zona || '-'} · {e.material || '-'}</p>
                              </button>
                            ))}
                          </div>
                        </div>

                        {ejerciciosEditando.map((ejercicio, index) => (
                          <div key={index} className="rounded-3xl bg-zinc-950/60 p-4 border border-white/5">
                            <div className="flex items-center justify-between gap-3 mb-3">
                              <p className="font-black text-lime-400">
                                Ejercicio {index + 1}
                              </p>

                              <button
                                onClick={() => eliminarEjercicioEditando(index)}
                                className="rounded-xl bg-red-500/20 text-red-300 px-3 py-2 text-sm font-black"
                              >
                                Eliminar
                              </button>
                            </div>

                            <div className="grid md:grid-cols-2 gap-3">
                              <input
                                value={ejercicio.bloque}
                                onChange={(e) => actualizarEjercicioEditando(index, 'bloque', e.target.value)}
                                placeholder="Bloque"
                                className="input-dark"
                              />

                              <input
                                value={ejercicio.nombre}
                                onChange={(e) => actualizarEjercicioEditando(index, 'nombre', e.target.value)}
                                placeholder="Ejercicio"
                                className="input-dark"
                              />

                              <input
                                value={ejercicio.series}
                                onChange={(e) => actualizarEjercicioEditando(index, 'series', e.target.value)}
                                placeholder="Series"
                                className="input-dark"
                              />

                              <input
                                value={ejercicio.reps}
                                onChange={(e) => actualizarEjercicioEditando(index, 'reps', e.target.value)}
                                placeholder="Reps"
                                className="input-dark"
                              />

                              <input
                                value={ejercicio.kgSugerido}
                                onChange={(e) => actualizarEjercicioEditando(index, 'kgSugerido', e.target.value)}
                                placeholder="Kg sugerido"
                                className="input-dark"
                              />

                              <input
                                value={ejercicio.rpe}
                                onChange={(e) => actualizarEjercicioEditando(index, 'rpe', e.target.value)}
                                placeholder="RPE"
                                className="input-dark"
                              />

                              <input
                                value={ejercicio.tempo}
                                onChange={(e) => actualizarEjercicioEditando(index, 'tempo', e.target.value)}
                                placeholder="Tempo"
                                className="input-dark"
                              />

                              <input
                                value={ejercicio.videoUrl}
                                onChange={(e) => actualizarEjercicioEditando(index, 'videoUrl', e.target.value)}
                                placeholder="Link de video"
                                className="input-dark"
                              />

                              <textarea
                                value={ejercicio.observaciones}
                                onChange={(e) => actualizarEjercicioEditando(index, 'observaciones', e.target.value)}
                                placeholder="Observaciones"
                                className="input-dark min-h-24 md:col-span-2"
                              />
                            </div>
                          </div>
                        ))}

                        <button
                          onClick={guardarEdicionRutina}
                          className="btn-green"
                        >
                          Guardar cambios de rutina
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {seccionPF === 'grupo' && (
                <FormCard title="Crear grupo">
                  <form onSubmit={addGroup} className="space-y-3">
                    <input name="rama" placeholder="Rama" className="input" required />
                    <input name="tira" placeholder="Tira" className="input" required />
                    <input name="categoria" placeholder="Categoría" className="input" required />
                    <input name="pf" placeholder="PF Responsable" className="input" required />
                    <button className="btn-green">+ Crear grupo</button>
                  </form>
                </FormCard>
              )}

              {seccionPF === 'jugador' && (
                <FormCard title="Cargar jugador/a">
                  <form onSubmit={addPlayer} className="space-y-3">
                    <input name="nombre" placeholder="Nombre" className="input" required />
                    <input name="apellido" placeholder="Apellido" className="input" required />
                    <input name="posicion" placeholder="Posición" className="input" />
                    <select value={grupoSeleccionado} onChange={(e) => setGrupoSeleccionado(e.target.value)} className="input" required>
                      <option value="">Elegir grupo</option>
                      {grupos.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.rama} · {g.tira} · {g.categoria}
                        </option>
                      ))}
                    </select>
                    <button className="btn-white">+ Cargar jugador/a</button>
                  </form>
                </FormCard>
              )}


              {seccionPF === 'perfilJugador' && (
                <FormCard title="Perfil físico del jugador">
                  <div className="grid md:grid-cols-2 gap-3">
                    <select
                      value={jugadorPerfil}
                      onChange={(e) => cargarPerfilExistente(e.target.value)}
                      className="input"
                    >
                      <option value="">Elegir jugador/a</option>
                      {jugadores.map((j) => (
                        <option key={j.id} value={j.nombreCompleto}>
                          {j.nombreCompleto} · {j.categoria}
                        </option>
                      ))}
                    </select>

                    <input
                      value={perfilForm.fotoUrl}
                      onChange={(e) => setPerfilForm({ ...perfilForm, fotoUrl: e.target.value })}
                      placeholder="URL de foto"
                      className="input"
                    />

                    <input
                      type="date"
                      value={perfilForm.fechaNacimiento}
                      onChange={(e) => setPerfilForm({ ...perfilForm, fechaNacimiento: e.target.value })}
                      className="input"
                    />

                    <input
                      value={perfilForm.manoDominante}
                      onChange={(e) => setPerfilForm({ ...perfilForm, manoDominante: e.target.value })}
                      placeholder="Mano dominante"
                      className="input"
                    />

                    <input
                      value={perfilForm.alturaCm}
                      onChange={(e) => setPerfilForm({ ...perfilForm, alturaCm: e.target.value })}
                      placeholder="Altura cm"
                      className="input"
                    />

                    <input
                      value={perfilForm.pesoKg}
                      onChange={(e) => setPerfilForm({ ...perfilForm, pesoKg: e.target.value })}
                      placeholder="Peso kg"
                      className="input"
                    />

                    <input
                      value={perfilForm.alcanceParadoCm}
                      onChange={(e) => setPerfilForm({ ...perfilForm, alcanceParadoCm: e.target.value })}
                      placeholder="Alcance a un brazo parado cm"
                      className="input"
                    />

                    <input
                      value={perfilForm.alcanceSaltoCm}
                      onChange={(e) => setPerfilForm({ ...perfilForm, alcanceSaltoCm: e.target.value })}
                      placeholder="Alcance a un brazo con salto cm"
                      className="input"
                    />

                    <input
                      value={perfilForm.saltoCm}
                      onChange={(e) => setPerfilForm({ ...perfilForm, saltoCm: e.target.value })}
                      placeholder="Salto cm"
                      className="input"
                    />

                    <input
                      value={perfilForm.saltoAbalakovCm}
                      onChange={(e) => setPerfilForm({ ...perfilForm, saltoAbalakovCm: e.target.value })}
                      placeholder="Salto Abalakov cm"
                      className="input"
                    />

                    <textarea
                      value={perfilForm.observaciones}
                      onChange={(e) => setPerfilForm({ ...perfilForm, observaciones: e.target.value })}
                      placeholder="Observaciones / historial físico / lesiones"
                      className="input min-h-24 md:col-span-2"
                    />
                  </div>

                  <button onClick={guardarPerfilJugador} className="btn-green mt-4">
                    Guardar perfil físico
                  </button>

                  <div className="mt-6 rounded-3xl bg-zinc-950/60 p-4 border border-white/5">
                    <h3 className="font-black text-xl">Nueva medición histórica</h3>
                    <p className="text-sm text-zinc-400 mt-1">Guardá cada evaluación física para ver evolución con el tiempo.</p>
                    <div className="grid md:grid-cols-3 gap-3 mt-4">
                      <input type="date" value={medicionForm.fecha} onChange={(e) => setMedicionForm({ ...medicionForm, fecha: e.target.value })} className="input-dark" />
                      <input value={medicionForm.altura} onChange={(e) => setMedicionForm({ ...medicionForm, altura: e.target.value })} placeholder="Altura cm" className="input-dark" />
                      <input value={medicionForm.peso} onChange={(e) => setMedicionForm({ ...medicionForm, peso: e.target.value })} placeholder="Peso kg" className="input-dark" />
                      <input value={medicionForm.alcanceParado} onChange={(e) => setMedicionForm({ ...medicionForm, alcanceParado: e.target.value })} placeholder="Alcance parado cm" className="input-dark" />
                      <input value={medicionForm.alcanceSalto} onChange={(e) => setMedicionForm({ ...medicionForm, alcanceSalto: e.target.value })} placeholder="Alcance salto cm" className="input-dark" />
                      <input value={medicionForm.salto} onChange={(e) => setMedicionForm({ ...medicionForm, salto: e.target.value })} placeholder="Salto cm" className="input-dark" />
                      <input value={medicionForm.abalakov} onChange={(e) => setMedicionForm({ ...medicionForm, abalakov: e.target.value })} placeholder="Abalakov cm" className="input-dark" />
                      <textarea value={medicionForm.observaciones} onChange={(e) => setMedicionForm({ ...medicionForm, observaciones: e.target.value })} placeholder="Observaciones" className="input-dark min-h-24 md:col-span-2" />
                    </div>
                    <button onClick={guardarMedicionFisica} className="btn-white mt-4">Guardar medición histórica</button>
                  </div>

                  {historialJugadorPerfil.length > 0 && (
                    <div className="mt-6 rounded-3xl bg-zinc-950/60 p-4 border border-white/5">
                      <h3 className="font-black text-xl">Historial físico</h3>
                      <div className="h-64 mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={historialJugadorPerfil.map((h) => ({ fecha: fechaISO(h.fecha), peso: Number(h.peso || 0), salto: Number(h.salto || 0), alcance: Number(h.alcanceSalto || 0) }))}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="fecha" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="peso" strokeWidth={3} />
                            <Line type="monotone" dataKey="salto" strokeWidth={3} />
                            <Line type="monotone" dataKey="alcance" strokeWidth={3} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-4 space-y-2">
                        {historialJugadorPerfil.slice(-5).reverse().map((h) => (
                          <div key={h.id} className="rounded-2xl bg-black/30 p-3 text-sm">
                            <p className="font-black">{fechaISO(h.fecha)}</p>
                            <p className="text-zinc-300">Peso {h.peso || '-'} kg · Salto {h.salto || '-'} cm · Alcance salto {h.alcanceSalto || '-'} cm</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </FormCard>
              )}


              {seccionPF === 'bancoEjercicios' && (
                <>
                  <div>
                    <h2 className="section-title">Banco / batería de ejercicios</h2>
                    <p className="section-subtitle">
                      Cargá ejercicios una vez y reutilizalos al armar rutinas.
                    </p>
                  </div>

                  <FormCard title="Cargar ejercicio individual">
                    <div className="grid md:grid-cols-2 gap-3">
                      <input value={bancoForm.ejercicio} onChange={(e) => setBancoForm({ ...bancoForm, ejercicio: e.target.value })} placeholder="Nombre del ejercicio" className="input" />
                      <input value={bancoForm.bloque} onChange={(e) => setBancoForm({ ...bancoForm, bloque: e.target.value })} placeholder="Bloque. Ej: Activación, Bloque 1, Fuerza" className="input" />
                      <input value={bancoForm.objetivo} onChange={(e) => setBancoForm({ ...bancoForm, objetivo: e.target.value })} placeholder="Objetivo. Ej: potencia, movilidad, preventivo" className="input" />
                      <input value={bancoForm.zona} onChange={(e) => setBancoForm({ ...bancoForm, zona: e.target.value })} placeholder="Zona. Ej: tren inferior, core, hombro" className="input" />
                      <input value={bancoForm.material} onChange={(e) => setBancoForm({ ...bancoForm, material: e.target.value })} placeholder="Material. Ej: banda, barra, cajón" className="input" />
                      <input value={bancoForm.videoUrl} onChange={(e) => setBancoForm({ ...bancoForm, videoUrl: e.target.value })} placeholder="Video URL" className="input" />
                      <textarea value={bancoForm.observaciones} onChange={(e) => setBancoForm({ ...bancoForm, observaciones: e.target.value })} placeholder="Observaciones" className="input min-h-24 md:col-span-2" />
                    </div>
                    <button onClick={guardarEjercicioBanco} className="btn-green mt-4">Guardar ejercicio en banco</button>
                  </FormCard>

                  <FormCard title="Carga masiva / batería completa">
                    <p className="text-sm text-zinc-400 mb-3">
                      Pegá un ejercicio por línea. Formato: Ejercicio | Bloque | Objetivo | Zona | Material | Video | Observaciones
                    </p>
                    <textarea
                      value={bancoCargaMasiva}
                      onChange={(e) => setBancoCargaMasiva(e.target.value)}
                      placeholder={"Sentadilla goblet | Fuerza | fuerza base | tren inferior | mancuerna | https://... | cuidar rodillas\nBand pull apart | Preventivo | hombro | tren superior | banda | | 2 segundos atrás"}
                      className="input min-h-48"
                    />
                    <button onClick={cargarBateriaEjercicios} className="btn-green mt-4">Cargar batería completa</button>
                  </FormCard>

                  <div className="premium-card">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div>
                        <h3 className="font-black text-xl">Biblioteca</h3>
                        <p className="text-zinc-400 text-sm mt-1">{bancoEjerciciosFiltrado.length} ejercicios encontrados</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-3 mt-4">
                      <input value={bancoFiltro.bloque} onChange={(e) => setBancoFiltro({ ...bancoFiltro, bloque: e.target.value })} placeholder="Filtrar por bloque" className="input" />
                      <input value={bancoFiltro.zona} onChange={(e) => setBancoFiltro({ ...bancoFiltro, zona: e.target.value })} placeholder="Filtrar por zona" className="input" />
                      <input value={bancoFiltro.material} onChange={(e) => setBancoFiltro({ ...bancoFiltro, material: e.target.value })} placeholder="Filtrar por material" className="input" />
                    </div>

                    <div className="grid md:grid-cols-2 gap-3 mt-5">
                      {bancoEjerciciosFiltrado.map((e) => (
                        <div key={e.id} className="exercise-card" style={estiloBloque(e.bloque)}>
                          <BloqueTag bloque={e.bloque} />
                          <p className="font-black">{e.ejercicio}</p>
                          <p className="text-sm text-zinc-300 mt-1">{e.objetivo || '-'} · {e.zona || '-'} · {e.material || '-'}</p>
                          {e.videoUrl && <p className="text-xs text-lime-300 mt-2 break-all">Video: {e.videoUrl}</p>}
                          {e.observaciones && <p className="text-sm text-zinc-400 mt-2">{e.observaciones}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}


              {esAdmin && seccionPF === 'usuarios' && (
                <FormCard title="Gestión de usuarios">
                  <div className="rounded-3xl bg-zinc-950/60 p-4 border border-white/5 mb-5">
                    <h3 className="font-black text-xl">Crear usuario</h3>
                    <p className="text-zinc-400 text-sm mt-1">
                      ADMIN puede configurar todo. PF puede gestionar lo deportivo. JUGADOR es la cuenta compartida para jugadores.
                    </p>

                    <div className="grid md:grid-cols-2 gap-3 mt-4">
                      <input
                        value={usuarioForm.nombre}
                        onChange={(e) => setUsuarioForm({ ...usuarioForm, nombre: e.target.value })}
                        placeholder="Nombre visible"
                        className="input"
                      />

                      <input
                        value={usuarioForm.email}
                        onChange={(e) => setUsuarioForm({ ...usuarioForm, email: e.target.value })}
                        placeholder="Email"
                        className="input"
                      />

                      <input
                        value={usuarioForm.password}
                        onChange={(e) => setUsuarioForm({ ...usuarioForm, password: e.target.value })}
                        placeholder="Contraseña"
                        className="input"
                      />

                      <select
                        value={usuarioForm.rol}
                        onChange={(e) => setUsuarioForm({ ...usuarioForm, rol: e.target.value })}
                        className="input"
                      >
                        <option value="ADMIN">ADMIN</option>
                        <option value="PF">PF</option>
                        <option value="JUGADOR">JUGADOR</option>
                      </select>

                      <select
                        value={usuarioForm.activo}
                        onChange={(e) => setUsuarioForm({ ...usuarioForm, activo: e.target.value })}
                        className="input"
                      >
                        <option value="SI">Activo</option>
                        <option value="NO">Inactivo</option>
                      </select>
                    </div>

                    <button onClick={guardarUsuario} className="btn-green mt-4">
                      Crear usuario
                    </button>
                  </div>

                  <div className="grid gap-3">
                    {usuarios.map((u) => (
                      <div key={u.email} className="exercise-card">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                          <div>
                            <p className="font-black text-lime-400">{u.nombre || u.email}</p>
                            <p className="text-sm text-zinc-400">{u.email}</p>
                          </div>

                          <div className="flex gap-2">
                            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black">
                              {u.rol}
                            </span>
                            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black">
                              {u.activo}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </FormCard>
              )}

              {esAdmin && seccionPF === 'adminVisual' && (
                <FormCard title="Personalización visual">
                  <div className="grid md:grid-cols-2 gap-3">
                    <input
                      value={configApp.appNombre || ''}
                      onChange={(e) => setConfigApp({ ...configApp, appNombre: e.target.value })}
                      placeholder="Nombre de la app"
                      className="input"
                    />

                    <input
                      value={configApp.subtitulo || ''}
                      onChange={(e) => setConfigApp({ ...configApp, subtitulo: e.target.value })}
                      placeholder="Subtítulo"
                      className="input"
                    />

                    <input
                      value={configApp.logoUrl || ''}
                      onChange={(e) => setConfigApp({ ...configApp, logoUrl: e.target.value })}
                      placeholder="URL del logo / imagen"
                      className="input"
                    />

                    <input
                      value={configApp.colorPrincipal || '#a3e635'}
                      onChange={(e) => setConfigApp({ ...configApp, colorPrincipal: e.target.value })}
                      placeholder="Color principal. Ej: #a3e635"
                      className="input"
                    />
                  </div>

                  <button onClick={guardarConfigVisual} className="btn-green mt-4">
                    Guardar estética
                  </button>
                </FormCard>
              )}

              {seccionPF === 'crearRutina' && (
                <FormCard title="Crear rutina">
                  <div className="space-y-3">
                    <input id="nombreRutina" placeholder="Nombre de rutina" className="input" />
                    <input id="semana" placeholder="Semana / Microciclo" className="input" />
                    <input id="dia" placeholder="Día" className="input" />
                    <input id="objetivo" placeholder="Objetivo" className="input" />
                    <select value={grupoRutina} onChange={(e) => setGrupoRutina(e.target.value)} className="input">
                      <option value="">Asignar a grupo</option>
                      {grupos.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.rama} · {g.tira} · {g.categoria}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mt-5 rounded-3xl bg-zinc-950/60 p-4 border border-white/5">
                    <h3 className="font-black text-lg">Agregar desde banco de ejercicios</h3>
                    <div className="grid md:grid-cols-3 gap-3 mt-3">
                      <input value={bancoFiltro.bloque} onChange={(e) => setBancoFiltro({ ...bancoFiltro, bloque: e.target.value })} placeholder="Filtro bloque" className="input-dark" />
                      <input value={bancoFiltro.zona} onChange={(e) => setBancoFiltro({ ...bancoFiltro, zona: e.target.value })} placeholder="Filtro zona" className="input-dark" />
                      <input value={bancoFiltro.material} onChange={(e) => setBancoFiltro({ ...bancoFiltro, material: e.target.value })} placeholder="Filtro material" className="input-dark" />
                    </div>
                    <div className="grid md:grid-cols-2 gap-2 mt-4 max-h-80 overflow-y-auto pr-1">
                      {bancoEjerciciosFiltrado.slice(0, 30).map((e) => (
                        <button key={e.id} type="button" onClick={() => agregarDesdeBancoARutina(e)} className="rounded-2xl bg-black/40 p-3 text-left border border-white/5 hover:border-lime-400/60">
                          <p className="font-black text-lime-300">+ {e.ejercicio}</p>
                          <p className="text-xs text-zinc-400 mt-1">{e.bloque || '-'} · {e.zona || '-'} · {e.material || '-'}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <form onSubmit={addExercise} className="mt-5 space-y-3 rounded-3xl bg-zinc-950/60 p-4 border border-white/5">
                    <h3 className="font-black text-lg">Agregar ejercicio manual</h3>
                    <input name="bloque" placeholder="Bloque" className="input-dark" required />
                    <input name="ejercicio" placeholder="Ejercicio" className="input-dark" required />
                    <input name="series" placeholder="Series" className="input-dark" />
                    <input name="reps" placeholder="Reps" className="input-dark" />
                    <input name="kgSugerido" placeholder="Kg sugerido" className="input-dark" />
                    <input name="rpe" placeholder="RPE" className="input-dark" />
                    <input name="tempo" placeholder="Tempo" className="input-dark" />
                    <input name="videoUrl" placeholder="Link de video" className="input-dark" />
                    <textarea name="observaciones" placeholder="Observaciones" className="input-dark min-h-24" />
                    <button className="btn-white">+ Agregar ejercicio</button>
                  </form>

                  {ejercicios.length > 0 && (
                    <div className="mt-5 space-y-3">
                      <h3 className="font-black">Ejercicios agregados</h3>
                      {ejercicios.map((e, index) => (
                        <div key={index} className="exercise-card">
                          <p className="font-black text-lime-400">{index + 1}. {e.nombre}</p>
                          <p className="text-zinc-300 text-sm">{e.bloque} · {e.series} series · {e.reps} reps</p>
                        </div>
                      ))}
                      <button onClick={saveRoutine} className="btn-green">Guardar rutina completa</button>
                    </div>
                  )}
                </FormCard>
              )}
            </section>
          </div>
        )}

        {tab === 'jugador' && (
          <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-5">
            <section className="premium-card">
              <h2 className="section-title">Mi grupo</h2>
              <select
                value={grupoJugador}
                onChange={(e) => {
                  setGrupoJugador(e.target.value);
                  setJugadorSeleccionado('');
                  setRutinaAbierta(null);
                  setDetalleRutina([]);
                }}
                className="input mt-4"
              >
                <option value="">Elegir grupo</option>
                {grupos.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.rama} · {g.tira} · {g.categoria}
                  </option>
                ))}
              </select>

              {perfilJugadorSeleccionado && (
                <div className="mt-5 rounded-3xl bg-zinc-900 p-4 border border-white/5">
                  <div className="flex gap-4 items-center">
                    {perfilJugadorSeleccionado.fotoUrl && (
                      <img
                        src={perfilJugadorSeleccionado.fotoUrl}
                        alt={jugadorSeleccionado}
                        className="h-20 w-20 rounded-3xl object-cover bg-white"
                      />
                    )}
                    <div>
                      <h3 className="font-black text-xl">Perfil físico</h3>
                      <p className="text-sm text-zinc-400">{jugadorSeleccionado}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 text-sm">
                    <div><p className="text-zinc-500">Altura</p><p className="font-black">{perfilJugadorSeleccionado.alturaCm || perfilJugadorSeleccionado.altura || '-'} cm</p></div>
                    <div><p className="text-zinc-500">Peso</p><p className="font-black">{perfilJugadorSeleccionado.pesoKg || perfilJugadorSeleccionado.peso || '-'} kg</p></div>
                    <div><p className="text-zinc-500">Alcance parado</p><p className="font-black">{perfilJugadorSeleccionado.alcanceParadoCm || perfilJugadorSeleccionado.alcanceParado || '-'} cm</p></div>
                    <div><p className="text-zinc-500">Alcance salto</p><p className="font-black">{perfilJugadorSeleccionado.alcanceSaltoCm || perfilJugadorSeleccionado.alcanceSalto || '-'} cm</p></div>
                    <div><p className="text-zinc-500">Salto</p><p className="font-black">{perfilJugadorSeleccionado.saltoCm || perfilJugadorSeleccionado.salto || '-'} cm</p></div>
                    <div><p className="text-zinc-500">Abalakov</p><p className="font-black">{perfilJugadorSeleccionado.saltoAbalakovCm || '-'} cm</p></div>
                    <div><p className="text-zinc-500">Mano</p><p className="font-black">{perfilJugadorSeleccionado.manoDominante || '-'}</p></div>
                  </div>

                  {perfilJugadorSeleccionado.observaciones && (
                    <p className="text-sm text-zinc-300 mt-4">{perfilJugadorSeleccionado.observaciones}</p>
                  )}
                </div>
              )}

              <div className="mt-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <h3 className="font-black text-xl">Rutinas de la semana</h3>
                    <p className="text-zinc-400 text-sm mt-1">
                      Podés abrir rutinas de toda la semana, no solo las del día.
                    </p>
                  </div>

                  <select
                    value={filtroSemana}
                    onChange={(e) => setFiltroSemana(e.target.value)}
                    className="input md:max-w-xs"
                  >
                    <option>Semana 1</option>
                    <option>Semana 2</option>
                    <option>Semana 3</option>
                    <option>Semana 4</option>
                    <option>Semana 5</option>
                    <option>Semana 6</option>
                    <option>Semana 7</option>
                    <option>Semana 8</option>
                  </select>
                </div>

                <div className="mt-3 space-y-3">
                  {grupoJugador && planificacionJugadorSemana.length === 0 && (
                    <div className="rounded-2xl bg-zinc-800 p-4 text-zinc-400">
                      Todavía no hay rutinas planificadas para este grupo en esta semana.
                    </div>
                  )}

                  {planificacionJugadorSemana.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        const rutina = rutinas.find(r => String(r.idRutina) === String(p.idRutina));
                        if (rutina) abrirRutina(rutina);
                      }}
                      className="routine-card"
                    >
                      <p className="font-black text-lime-400">{p.nombreRutina}</p>
                      <p className="text-sm text-zinc-300">{p.semana} · {p.dia}</p>
                      <p className="text-sm text-zinc-400">
                        {p.fecha ? fechaISO(p.fecha) : 'Sin fecha exacta'}
                      </p>
                    </button>
                  ))}

                  {grupoJugador && planificacionJugadorSemana.length === 0 && rutinasJugador.length > 0 && (
                    <div className="mt-4">
                      <p className="text-zinc-400 text-sm mb-2">
                        Rutinas cargadas para el grupo, todavía sin planificación semanal:
                      </p>

                      {rutinasJugador.map((r) => (
                        <button key={r.idRutina} onClick={() => abrirRutina(r)} className="routine-card mb-2">
                          <p className="font-black text-lime-400">{r.nombreRutina}</p>
                          <p className="text-sm text-zinc-300">Semana {r.semana} · {r.dia}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section className="premium-card">
              <h2 className="section-title">Wellness diario</h2>
              <form onSubmit={guardarWellness} className="mt-4 space-y-3">
                <select
                  value={jugadorSeleccionado}
                  onChange={(e) => setJugadorSeleccionado(e.target.value)}
                  className="input"
                  required
                >
                  <option value="">Elegir jugador/a</option>
                  {jugadoresDelGrupo.map((j) => (
                    <option key={j.id} value={j.nombreCompleto}>
                      {j.nombreCompleto}
                    </option>
                  ))}
                </select>

                <Slider label="Sueño" value={sueno} setValue={setSueno} />
                <Slider label="Fatiga" value={fatiga} setValue={setFatiga} />
                <Slider label="Dolor muscular" value={dolorMuscular} setValue={setDolorMuscular} />
                <Slider label="Estrés" value={estres} setValue={setEstres} />
                <Slider label="Motivación" value={motivacion} setValue={setMotivacion} />
                <div className="rounded-3xl bg-zinc-950/60 p-4 border border-white/5">
                  <p className="text-sm text-zinc-400">Readiness estimado</p>
                  <p className="text-4xl font-black text-lime-400 mt-1">{readinessScore}%</p>
                  <p className="text-xs text-zinc-500 mt-1">Se calcula con sueño, fatiga, dolor, estrés y motivación.</p>
                </div>
                <textarea name="comentarios" placeholder="Comentarios / molestias" className="input min-h-24" />
                <button className="btn-green">Guardar wellness</button>
              </form>
            </section>

            <section className="premium-card">
              <h2 className="section-title">Asistencia</h2>
              <form onSubmit={guardarAsistencia} className="mt-4 space-y-3">
                <select
                  value={jugadorSeleccionado}
                  onChange={(e) => setJugadorSeleccionado(e.target.value)}
                  className="input"
                  required
                >
                  <option value="">Elegir jugador/a</option>
                  {jugadoresDelGrupo.map((j) => (
                    <option key={j.id} value={j.nombreCompleto}>
                      {j.nombreCompleto}
                    </option>
                  ))}
                </select>

                <select name="estado" className="input" required>
                  <option value="">Estado</option>
                  <option value="PRESENTE">Presente</option>
                  <option value="AUSENTE">Ausente</option>
                  <option value="LESIONADO">Lesionado</option>
                  <option value="ADAPTADO">Adaptado</option>
                </select>
                <textarea name="observaciones" placeholder="Observaciones" className="input min-h-24" />
                <button className="btn-white">Guardar asistencia</button>
              </form>
            </section>

            {jugadorSeleccionado && (
              <section className="premium-card lg:col-span-2">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <h2 className="section-title">Historial individual</h2>
                    <p className="text-zinc-400 text-sm mt-1">{jugadorSeleccionado}</p>
                  </div>

                  <button
                    onClick={cargarTodo}
                    className="rounded-2xl bg-lime-400 text-black px-4 py-3 font-black"
                  >
                    Actualizar datos
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
                  <Stat label="Wellness" value={wellnessJugador.length} />
                  <Stat label="Asistencias" value={asistenciaJugador.length} />
                  <Stat label="Fatiga prom." value={fatigaPromedio} tone="yellow" />
                  <Stat label="Sueño prom." value={suenoPromedio} tone="blue" />
                </div>

                {wellnessGrafico.length > 0 && (
                  <div className="premium-card mt-5">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <div>
                        <h3 className="font-black text-xl">Evolución wellness</h3>
                        <p className="text-zinc-400 text-sm mt-1">Fatiga, sueño y motivación de los últimos registros</p>
                      </div>
                      <div className="text-xs text-zinc-400">
                        <span className="text-red-400 font-bold">Fatiga</span> · <span className="text-cyan-400 font-bold">Sueño</span> · <span className="text-lime-400 font-bold">Motivación</span>
                      </div>
                    </div>

                    <div className="mt-6" style={{ width: '100%', height: 300 }}>
                      <ResponsiveContainer>
                        <LineChart data={wellnessGrafico}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                          <XAxis dataKey="dia" stroke="#a1a1aa" />
                          <YAxis stroke="#a1a1aa" domain={[0, 10]} />
                          <Tooltip />
                          <Line type="monotone" dataKey="fatiga" stroke="#ef4444" strokeWidth={3} dot />
                          <Line type="monotone" dataKey="sueno" stroke="#06b6d4" strokeWidth={3} dot />
                          <Line type="monotone" dataKey="motivacion" stroke="#84cc16" strokeWidth={3} dot />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {alertasPersonales.length > 0 && (
                  <div className="alert-box mt-5">
                    <h3 className="font-black text-red-300">Alertas personales</h3>

                    <div className="mt-3 space-y-3">
                      {alertasPersonales.slice(-5).reverse().map((w) => (
                        <div key={w.id} className="rounded-2xl bg-black/40 p-4 border border-red-500/10">
                          <p className="font-black">
                            Fatiga {w.fatiga}/10 · Sueño {w.sueno}/10
                          </p>
                          <p className="text-sm text-zinc-400 mt-1">
                            Dolor muscular: {w.dolorMuscular}/10
                          </p>
                          {w.comentarios && (
                            <p className="text-sm text-zinc-300 mt-2">{w.comentarios}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {historialJugadorSeleccionado.length > 0 && (
                  <div className="premium-card mt-6">
                    <h3 className="font-black text-xl">Mi evolución física</h3>
                    <div className="h-64 mt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={historialJugadorSeleccionado.map((h) => ({ fecha: fechaISO(h.fecha), peso: Number(h.peso || 0), salto: Number(h.salto || 0), alcance: Number(h.alcanceSalto || 0) }))}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="fecha" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="peso" strokeWidth={3} />
                          <Line type="monotone" dataKey="salto" strokeWidth={3} />
                          <Line type="monotone" dataKey="alcance" strokeWidth={3} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">
                  <div>
                    <h3 className="font-black text-xl">Últimos wellness</h3>

                    <div className="mt-3 space-y-3">
                      {wellnessJugador.slice(-5).reverse().map((w) => (
                        <div key={w.id} className="exercise-card">
                          <div className="flex justify-between gap-3">
                            <div>
                              <p className="font-black">
                                Sueño {w.sueno}/10 · Fatiga {w.fatiga}/10
                              </p>
                              <p className="text-sm text-zinc-400 mt-1">
                                Estrés {w.estres}/10 · Motivación {w.motivacion}/10
                              </p>
                            </div>
                            <div className="text-xs text-zinc-500 whitespace-nowrap">
                              {new Date(w.fecha).toLocaleDateString()}
                            </div>
                          </div>
                          {w.comentarios && (
                            <p className="text-sm text-zinc-300 mt-3">{w.comentarios}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-black text-xl">Últimas asistencias</h3>

                    <div className="mt-3 space-y-3">
                      {asistenciaJugador.slice(-5).reverse().map((a) => (
                        <div key={a.id} className="exercise-card">
                          <div className="flex justify-between gap-3">
                            <div>
                              <p className="font-black">{a.estado}</p>
                              {a.observaciones && (
                                <p className="text-sm text-zinc-400 mt-1">{a.observaciones}</p>
                              )}
                            </div>
                            <div className="text-xs text-zinc-500 whitespace-nowrap">
                              {new Date(a.fecha).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {rutinaAbierta && (
              <section className="premium-card lg:col-span-2">
                <h3 className="text-2xl font-black text-lime-400">{rutinaAbierta.nombreRutina}</h3>
                <div className="mt-4 space-y-3">
                  {detalleRutina.map((e) => (
                    <div key={e.idDetalle} className="exercise-card" style={estiloBloque(e.bloque)}>
                      <BloqueTag bloque={e.bloque} />
                      <p className="font-black">{e.orden}. {e.ejercicio}</p>
                      <p className="text-sm text-zinc-300">
                        {e.bloque} · {e.series} series · {e.reps} reps
                      </p>
                      <p className="text-sm text-zinc-400">
                        Kg sugerido: {e.kgSugerido || '-'} · RPE {e.rpe || '-'} · Tempo {e.tempo || '-'}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .hero {
          border-radius: 2rem;
          background: radial-gradient(circle at top left, rgba(163,230,53,0.18), transparent 35%), #111113;
          border: 1px solid rgba(255,255,255,0.08);
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-shadow: 0 20px 80px rgba(0,0,0,0.35);
        }

        @media (min-width: 768px) {
          .hero { flex-direction: row; align-items: center; }
        }

        .top-tab {
          border-radius: 1rem;
          background: #27272a;
          padding: 0.8rem 1rem;
          font-weight: 900;
          color: white;
        }

        .top-tab-active {
          background: #a3e635;
          color: black;
        }

        .sidebar {
          border-radius: 2rem;
          background: #111113;
          border: 1px solid rgba(255,255,255,0.08);
          padding: 1rem;
          height: fit-content;
          display: grid;
          gap: 0.5rem;
          position: sticky;
          top: 1rem;
        }

        .nav-btn {
          text-align: left;
          border-radius: 1rem;
          background: transparent;
          color: #a1a1aa;
          padding: 0.9rem 1rem;
          font-weight: 800;
        }

        .nav-active {
          background: #a3e635;
          color: black;
        }

        .premium-card, .routine-card, .exercise-card {
          border-radius: 1.5rem;
          background: #111113;
          border: 1px solid rgba(255,255,255,0.08);
          padding: 1rem;
          box-shadow: 0 18px 60px rgba(0,0,0,0.25);
        }

        .routine-card {
          width: 100%;
          text-align: left;
          transition: transform .15s ease, border-color .15s ease;
        }

        .routine-card:hover {
          transform: translateY(-2px);
          border-color: rgba(163,230,53,0.45);
        }

        .alert-box {
          border-radius: 1.5rem;
          background: rgba(127,29,29,0.35);
          border: 1px solid rgba(248,113,113,0.3);
          padding: 1rem;
        }

        .section-title {
          font-size: 1.6rem;
          font-weight: 950;
          letter-spacing: -0.03em;
        }

        .section-subtitle {
          color: #a1a1aa;
          margin-top: 0.25rem;
        }

        .input {
          width: 100%;
          border-radius: 1rem;
          background: #27272a;
          border: 1px solid rgba(255,255,255,0.06);
          padding: 1rem;
          outline: none;
          color: white;
        }

        .input-dark {
          width: 100%;
          border-radius: 1rem;
          background: #050505;
          border: 1px solid rgba(255,255,255,0.06);
          padding: 1rem;
          outline: none;
          color: white;
        }

        .input::placeholder,
        .input-dark::placeholder {
          color: #a1a1aa;
        }

        .btn-green {
          width: 100%;
          border-radius: 1rem;
          background: #a3e635;
          color: black;
          padding: 1rem;
          font-weight: 950;
        }

        .btn-white {
          width: 100%;
          border-radius: 1rem;
          background: white;
          color: black;
          padding: 1rem;
          font-weight: 950;
        }

        select.input {
          background: #ffffff;
          color: #111827;
          border: 2px solid rgba(163,230,53,0.65);
          font-weight: 800;
        }

        select.input:hover {
          background: #f7fee7;
        }

        select.input:focus {
          box-shadow: 0 0 0 4px rgba(163,230,53,0.30);
          border-color: #a3e635;
        }

        option {
          color: #111827;
          background: #ffffff;
          font-weight: 700;
        }

        @media print {
          .sidebar,
          .top-tab,
          button,
          textarea,
          input,
          select {
            display: none !important;
          }

          main {
            background: white !important;
            color: black !important;
          }

          .premium-card,
          .routine-card,
          .exercise-card {
            background: white !important;
            color: black !important;
            border: 1px solid #ddd !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </main>
  );
}

function FormCard({ title, children }) {
  return (
    <div className="premium-card">
      <h2 className="section-title">{title}</h2>
      <div className="mt-5">{children}</div>
    </div>
  );
}
