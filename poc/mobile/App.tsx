import React, { useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, Text, View, Pressable, TextInput } from 'react-native';

const AGENTS = [
  { id: 'todo-builder', name: 'Todo Widget Builder', desc: 'Generate and evolve a todo widget app', widgets: ['Planning Board', 'Today List', 'Done List'] },
  { id: 'ops-checklist', name: 'Ops Checklist', desc: 'Track daily team operations', widgets: ['Checklist', 'Alerts', 'Daily Notes'] },
  { id: 'habit-coach', name: 'Habit Coach', desc: 'Turn routines into actionable widgets', widgets: ['Routine Board', 'Streaks', 'Weekly Review'] },
] as const;

type Tab = 'Widget' | 'States' | 'Memory' | 'Payload';

export default function App() {
  const [agentId, setAgentId] = useState<(typeof AGENTS)[number]['id']>('todo-builder');
  const [tab, setTab] = useState<Tab>('Widget');
  const [mode, setMode] = useState('planning');
  const [prompt, setPrompt] = useState('Build me a todo app widget with Today, Upcoming, and Done states.');
  const [globalNs, setGlobalNs] = useState('global:user:matt');
  const [sessionNs, setSessionNs] = useState('session:widget-demo');

  const activeAgent = useMemo(() => AGENTS.find((a) => a.id === agentId) ?? AGENTS[0], [agentId]);

  const payload = useMemo(
    () => ({
      runtimeVersion: 1,
      shellTargets: ['expo-native', 'web'],
      screen: 'full-widget',
      prompt,
      mode,
      states: ['planning', 'active', 'done'],
      agent: activeAgent,
      memory: {
        global: globalNs,
        agent: `agent:${activeAgent.id}`,
        session: sessionNs,
      },
    }),
    [activeAgent, globalNs, mode, prompt, sessionNs]
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#070c1a' }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        <Text style={{ color: '#eff4ff', fontSize: 28, fontWeight: '700' }}>Prompt → Widget App</Text>
        <Text style={{ color: '#adbbe2' }}>No chat thread. Prompt generates the full-screen widget UI.</Text>

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
          <Text style={label}>PROMPT</Text>
          <TextInput value={prompt} onChangeText={setPrompt} style={input} placeholderTextColor="#778ab8" multiline />
          <Text style={label}>WIDGET CONTEXT</Text>
          <TextInput value={mode} onChangeText={setMode} style={input} placeholderTextColor="#778ab8" />
          <TextInput value={globalNs} onChangeText={setGlobalNs} style={input} placeholderTextColor="#778ab8" />
          <TextInput value={sessionNs} onChangeText={setSessionNs} style={input} placeholderTextColor="#778ab8" />
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {(['Widget', 'States', 'Memory', 'Payload'] as Tab[]).map((t) => (
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

        {tab === 'Widget' && (
          <View style={panel}>
            <Text style={label}>GENERATED WIDGET</Text>
            <Text style={{ color: '#eff4ff', fontSize: 18, fontWeight: '700' }}>{activeAgent.name} • {mode}</Text>
            <Text style={{ color: '#adbbe2', marginTop: 8 }}>{activeAgent.widgets.join(' • ')}</Text>
            <Text style={{ color: '#9ec4ff', marginTop: 8 }}>Prompt: {prompt}</Text>
          </View>
        )}

        {tab === 'States' && (
          <View style={panel}>
            <Text style={label}>TODO APP STATES</Text>
            <Text style={line}><Text style={{color:'#eff4ff'}}>Planning</Text> — capture tasks and priorities</Text>
            <Text style={line}><Text style={{color:'#eff4ff'}}>Active</Text> — focus mode + quick complete</Text>
            <Text style={line}><Text style={{color:'#eff4ff'}}>Done</Text> — completed tasks + review</Text>
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
