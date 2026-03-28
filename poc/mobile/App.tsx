import React, { useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, Text, View, Pressable, TextInput } from 'react-native';

const AGENTS = [
  { id: 'forge-builder', name: 'Forge Builder', ns: 'agent:forge-builder' },
  { id: 'pixel-ops', name: 'Pixel Ops', ns: 'agent:pixel-ops' },
  { id: 'tuner-growth', name: 'Tuner Growth', ns: 'agent:tuner-growth' },
];

export default function App() {
  const [agentId, setAgentId] = useState(AGENTS[0].id);
  const [globalNs, setGlobalNs] = useState('global:user:matt');
  const [sessionNs, setSessionNs] = useState('session:demo');
  const [widgetTheme, setWidgetTheme] = useState('midnight');

  const activeAgent = useMemo(() => AGENTS.find((a) => a.id === agentId) ?? AGENTS[0], [agentId]);

  const payload = useMemo(
    () => ({
      runtimeVersion: 1,
      shellTargets: ['expo-native', 'web'],
      memory: {
        global: globalNs,
        agent: activeAgent.ns,
        session: sessionNs,
      },
      agent: activeAgent,
      widgetConfig: {
        theme: widgetTheme,
        density: 'compact',
      },
    }),
    [activeAgent, globalNs, sessionNs, widgetTheme]
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#090f22' }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        <Text style={{ color: '#eff5ff', fontSize: 28, fontWeight: '700' }}>Pixel Agents POC</Text>
        <Text style={{ color: '#b8c6ea' }}>React Native shell for customizable agent widgets + scoped memory.</Text>

        <View style={{ backgroundColor: '#121b38', padding: 12, borderRadius: 12, gap: 8 }}>
          <Text style={{ color: '#eff5ff', fontWeight: '700' }}>Pick agent</Text>
          {AGENTS.map((agent) => (
            <Pressable
              key={agent.id}
              onPress={() => setAgentId(agent.id)}
              style={{
                padding: 10,
                borderRadius: 10,
                backgroundColor: agentId === agent.id ? '#5be5ff' : '#1a2548',
              }}
            >
              <Text style={{ color: agentId === agent.id ? '#051019' : '#eff5ff', fontWeight: '600' }}>{agent.name}</Text>
            </Pressable>
          ))}
        </View>

        <View style={{ backgroundColor: '#121b38', padding: 12, borderRadius: 12, gap: 8 }}>
          <Text style={{ color: '#eff5ff', fontWeight: '700' }}>Memory namespaces</Text>
          <TextInput value={globalNs} onChangeText={setGlobalNs} style={inputStyle} placeholderTextColor="#7d90c7" />
          <TextInput value={sessionNs} onChangeText={setSessionNs} style={inputStyle} placeholderTextColor="#7d90c7" />
          <TextInput value={widgetTheme} onChangeText={setWidgetTheme} style={inputStyle} placeholderTextColor="#7d90c7" />
        </View>

        <View style={{ backgroundColor: '#121b38', padding: 12, borderRadius: 12 }}>
          <Text style={{ color: '#eff5ff', fontWeight: '700', marginBottom: 8 }}>Unified payload</Text>
          <Text style={{ color: '#9ac3ff', fontFamily: 'Courier' }}>{JSON.stringify(payload, null, 2)}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const inputStyle = {
  backgroundColor: '#0e1530',
  borderRadius: 10,
  borderWidth: 1,
  borderColor: '#2c3b66',
  color: '#eff5ff',
  paddingHorizontal: 10,
  paddingVertical: 10,
} as const;
