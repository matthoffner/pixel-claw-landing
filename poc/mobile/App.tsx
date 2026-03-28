import React, { useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, Text, View, Pressable, TextInput } from 'react-native';

const AGENTS = [
  { id: 'forge-builder', name: 'Forge Builder', desc: 'Ship product surfaces', widgets: ['Execution Board', 'Impact KPIs', 'Release Queue'] },
  { id: 'pixel-ops', name: 'Pixel Ops', desc: 'Operate incidents and deploy health', widgets: ['Ops Board', 'Alerts', 'Runbook'] },
  { id: 'tuner-growth', name: 'Tuner Growth', desc: 'Conversion and GTM microapps', widgets: ['Experiment Grid', 'Funnel Health', 'Campaign Queue'] },
] as const;

type Tab = 'Overview' | 'Workflow' | 'Memory' | 'Payload';

export default function App() {
  const [agentId, setAgentId] = useState<(typeof AGENTS)[number]['id']>('forge-builder');
  const [tab, setTab] = useState<Tab>('Overview');
  const [mode, setMode] = useState('operator');
  const [globalNs, setGlobalNs] = useState('global:user:matt');
  const [sessionNs, setSessionNs] = useState('session:widget-demo');

  const activeAgent = useMemo(() => AGENTS.find((a) => a.id === agentId) ?? AGENTS[0], [agentId]);

  const payload = useMemo(
    () => ({
      runtimeVersion: 1,
      shellTargets: ['expo-native', 'web'],
      screen: 'full-widget',
      mode,
      agent: activeAgent,
      memory: {
        global: globalNs,
        agent: `agent:${activeAgent.id}`,
        session: sessionNs,
      },
    }),
    [activeAgent, globalNs, mode, sessionNs]
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#070c1a' }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        <Text style={{ color: '#eff4ff', fontSize: 28, fontWeight: '700' }}>Pixel Widget OS</Text>
        <Text style={{ color: '#adbbe2' }}>Chat-free microapp shell. Widget is entire app screen.</Text>

        <View style={panel}>
          <Text style={label}>AGENT</Text>
          {AGENTS.map((agent) => (
            <Pressable
              key={agent.id}
              onPress={() => setAgentId(agent.id)}
              style={{
                padding: 11,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: agent.id === agentId ? '#5be5ff' : '#2a3965',
                backgroundColor: agent.id === agentId ? '#18334a' : '#0d1530',
                marginBottom: 8,
              }}
            >
              <Text style={{ color: '#eff4ff', fontWeight: '700' }}>{agent.name}</Text>
              <Text style={{ color: '#adbbe2', marginTop: 2 }}>{agent.desc}</Text>
            </Pressable>
          ))}
        </View>

        <View style={panel}>
          <Text style={label}>WIDGET CONTEXT</Text>
          <TextInput value={mode} onChangeText={setMode} style={input} placeholderTextColor="#778ab8" />
          <TextInput value={globalNs} onChangeText={setGlobalNs} style={input} placeholderTextColor="#778ab8" />
          <TextInput value={sessionNs} onChangeText={setSessionNs} style={input} placeholderTextColor="#778ab8" />
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {(['Overview', 'Workflow', 'Memory', 'Payload'] as Tab[]).map((t) => (
            <Pressable
              key={t}
              onPress={() => setTab(t)}
              style={{
                borderWidth: 1,
                borderColor: tab === t ? '#5be5ff' : '#2a3965',
                backgroundColor: tab === t ? '#5be5ff' : '#0d1530',
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 999,
              }}
            >
              <Text style={{ color: tab === t ? '#04111a' : '#eff4ff', fontWeight: '700' }}>{t}</Text>
            </Pressable>
          ))}
        </View>

        {tab === 'Overview' && (
          <View style={panel}>
            <Text style={label}>WIDGET STACK</Text>
            <Text style={{ color: '#eff4ff', fontSize: 18, fontWeight: '700' }}>{activeAgent.name} • {mode}</Text>
            <Text style={{ color: '#adbbe2', marginTop: 8 }}>{activeAgent.widgets.join(' • ')}</Text>
          </View>
        )}

        {tab === 'Workflow' && (
          <View style={panel}>
            <Text style={label}>EXECUTION FLOW</Text>
            <Text style={line}>1) Select specialized widget agent</Text>
            <Text style={line}>2) Inject memory profile (global + agent + session)</Text>
            <Text style={line}>3) Execute through full-screen widget UI</Text>
            <Text style={line}>4) Share same payload contract to web + native</Text>
          </View>
        )}

        {tab === 'Memory' && (
          <View style={panel}>
            <Text style={label}>MEMORY NAMESPACES</Text>
            <Text style={line}>Global: {payload.memory.global}</Text>
            <Text style={line}>Agent: {payload.memory.agent}</Text>
            <Text style={line}>Session: {payload.memory.session}</Text>
          </View>
        )}

        {tab === 'Payload' && (
          <View style={panel}>
            <Text style={label}>UNIFIED PAYLOAD</Text>
            <Text style={{ color: '#9ec4ff', fontFamily: 'Courier' }}>{JSON.stringify(payload, null, 2)}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const panel = {
  borderWidth: 1,
  borderColor: '#2a3965',
  borderRadius: 12,
  backgroundColor: '#111a33',
  padding: 12,
} as const;

const label = {
  color: '#9dc8ff',
  fontSize: 12,
  fontWeight: '700',
  marginBottom: 8,
} as const;

const input = {
  backgroundColor: '#0b132b',
  borderWidth: 1,
  borderColor: '#2f3f6c',
  borderRadius: 10,
  color: '#eff4ff',
  paddingHorizontal: 10,
  paddingVertical: 10,
  marginBottom: 8,
} as const;

const line = {
  color: '#adbbe2',
  marginBottom: 7,
} as const;
