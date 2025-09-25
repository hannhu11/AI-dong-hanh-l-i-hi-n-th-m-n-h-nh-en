import React, { useState, useEffect, memo } from 'react';
import {
  Container, Title, Text, Button, Card, Group, Badge, Stack,
  Modal, TextInput, Textarea, Select, ActionIcon, Tooltip,
  Flex, Alert, Loader, Divider, ThemeIcon
} from '@mantine/core';
import {
  IconPlayerPlay, IconPlus, IconEdit, IconTrash, IconBolt,
  IconApps, IconLink, IconFolder, IconCode, IconClock,
  IconRocket, IconTarget, IconBulb, IconSearch
} from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  scenariosManager, Scenario, ScenarioAction, ActionType,
  executeScenario, getScenarioSuggestions, searchScenarios
} from '../../services/scenariosService';
import './ScenariosTab.css';

// Action type icons mapping
const ACTION_ICONS: Record<ActionType, React.ReactNode> = {
  open_app: <IconApps size={16} />,
  open_url: <IconLink size={16} />,
  open_folder: <IconFolder size={16} />,
  run_command: <IconCode size={16} />,
  delay: <IconClock size={16} />
};

// Category colors
const CATEGORY_COLORS: Record<Scenario['category'], string> = {
  work: 'blue',
  personal: 'green', 
  development: 'violet',
  entertainment: 'orange',
  custom: 'gray'
};

const ScenariosTab: React.FC = () => {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Modal states
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [isCreating, setIsCreating] = useState(false);

  // Form state for creating/editing scenarios
  const [formData, setFormData] = useState<Partial<Scenario>>({
    name: '',
    description: '',
    icon: '⚡',
    category: 'custom',
    actions: [],
    tags: [],
    isActive: true
  });

  // Load scenarios on mount
  useEffect(() => {
    const loadedScenarios = scenariosManager.getAllScenarios();
    setScenarios(loadedScenarios);

    // Listen for scenario changes
    const handleScenariosChange = (updatedScenarios: Scenario[]) => {
      setScenarios(updatedScenarios);
    };

    scenariosManager.addListener(handleScenariosChange);
    
    return () => {
      scenariosManager.removeListener(handleScenariosChange);
    };
  }, []);

  // Load AI suggestions
  useEffect(() => {
    const loadSuggestions = async () => {
      setLoadingSuggestions(true);
      try {
        const aiSuggestions = await getScenarioSuggestions();
        setSuggestions(aiSuggestions);
      } catch (error) {
        console.error('Error loading suggestions:', error);
      } finally {
        setLoadingSuggestions(false);
      }
    };

    loadSuggestions();
  }, []);

  // Handle scenario execution
  const handleExecuteScenario = async (scenario: Scenario) => {
    if (isExecuting) return;

    setIsExecuting(true);
    notifications.show({
      id: `executing-${scenario.id}`,
      title: '🚀 Đang thực thi...',
      message: `"${scenario.name}" - ${scenario.actions.length} hành động`,
      loading: true,
      autoClose: false
    });

    try {
      const result = await executeScenario(scenario.id);
      
      notifications.update({
        id: `executing-${scenario.id}`,
        title: result.success ? '✅ Thành công!' : '⚠️ Hoàn thành có lỗi',
        message: result.message,
        loading: false,
        color: result.success ? 'green' : 'orange',
        autoClose: 5000
      });

      // Refresh scenarios to update usage count
      const updatedScenarios = scenariosManager.getAllScenarios();
      setScenarios(updatedScenarios);
      
    } catch (error) {
      notifications.update({
        id: `executing-${scenario.id}`,
        title: '❌ Lỗi!',
        message: 'Không thể thực thi scenario',
        loading: false,
        color: 'red',
        autoClose: 5000
      });
    } finally {
      setIsExecuting(false);
    }
  };

  // Handle create/edit modal
  const handleOpenCreateModal = () => {
    setIsCreating(true);
    setSelectedScenario(null);
    setFormData({
      name: '',
      description: '',
      icon: '⚡',
      category: 'custom',
      actions: [],
      tags: [],
      isActive: true
    });
    openModal();
  };

  const handleOpenEditModal = (scenario: Scenario) => {
    setIsCreating(false);
    setSelectedScenario(scenario);
    setFormData(scenario);
    openModal();
  };

  // Filter scenarios based on search
  const filteredScenarios = searchQuery 
    ? searchScenarios(searchQuery)
    : scenarios;

  const displayedScenarios = filteredScenarios.filter(s => s.isActive);

  return (
    <Container size="lg" py="xl">
      {/* Header */}
      <div className="scenarios-header">
        <Group justify="space-between" mb="xl">
          <div>
            <Title order={2}>
              <ThemeIcon size="lg" variant="light" color="blue" mr="sm">
                <IconRocket size={20} />
              </ThemeIcon>
              🎯 Quản Lý Kịch Bản
            </Title>
            <Text c="dimmed" size="sm">
              Tự động hóa workflow với AI thông minh - Tạo và thực thi các chuỗi hành động
            </Text>
          </div>
          
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={handleOpenCreateModal}
            variant="filled"
            size="sm"
          >
            Tạo Kịch Bản
          </Button>
        </Group>

        {/* Search */}
        <TextInput
          placeholder="🔍 Tìm kiếm kịch bản..."
          leftSection={<IconSearch size={16} />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
          mb="md"
        />
      </div>

      {/* AI Suggestions */}
      <Card withBorder mb="xl" className="suggestions-card">
        <Group justify="space-between" mb="md">
          <Group>
            <ThemeIcon size="sm" variant="light" color="violet">
              <IconBulb size={14} />
            </ThemeIcon>
            <Text fw={600} size="sm">AI Gợi Ý Kịch Bản</Text>
          </Group>
          {loadingSuggestions && <Loader size="xs" />}
        </Group>

        <Stack gap="xs">
          {suggestions.map((suggestion, index) => (
            <Alert 
              key={index}
              variant="light" 
              color="violet"
              title={suggestion}
              style={{ cursor: 'pointer' }}
              onClick={handleOpenCreateModal}
            >
              <Text size="xs" c="dimmed">
                Nhấp để tạo kịch bản dựa trên gợi ý này
              </Text>
            </Alert>
          ))}
        </Stack>
      </Card>

      {/* Scenarios Grid */}
      <div className="scenarios-grid">
        {displayedScenarios.length === 0 ? (
          <Card withBorder p="xl" className="empty-state">
            <Stack align="center" gap="md">
              <ThemeIcon size="xl" variant="light" color="gray">
                <IconTarget size={32} />
              </ThemeIcon>
              <div style={{ textAlign: 'center' }}>
                <Text fw={600} mb="xs">Chưa có kịch bản nào</Text>
                <Text c="dimmed" size="sm">
                  Tạo kịch bản đầu tiên để tự động hóa workflow của bạn!
                </Text>
              </div>
              <Button 
                leftSection={<IconPlus size={16} />}
                onClick={handleOpenCreateModal}
                variant="light"
              >
                Tạo Kịch Bản Đầu Tiên
              </Button>
            </Stack>
          </Card>
        ) : (
          <div className="scenarios-list">
            {displayedScenarios.map((scenario) => (
              <Card 
                key={scenario.id} 
                withBorder 
                className="scenario-card"
                padding="md"
              >
                {/* Header */}
                <Group justify="space-between" mb="sm">
                  <Group>
                    <Text size="lg">{scenario.icon}</Text>
                    <div>
                      <Text fw={600} size="sm" truncate>
                        {scenario.name}
                      </Text>
                      <Badge 
                        size="xs" 
                        variant="light"
                        color={CATEGORY_COLORS[scenario.category]}
                      >
                        {scenario.category}
                      </Badge>
                    </div>
                  </Group>

                  <Group gap="xs">
                    <Tooltip label="Chỉnh sửa">
                      <ActionIcon
                        variant="subtle"
                        size="sm"
                        onClick={() => handleOpenEditModal(scenario)}
                      >
                        <IconEdit size={14} />
                      </ActionIcon>
                    </Tooltip>

                    <Tooltip label="Xóa">
                      <ActionIcon
                        variant="subtle"
                        size="sm"
                        color="red"
                        onClick={() => {
                          scenariosManager.deleteScenario(scenario.id);
                          notifications.show({
                            message: `Đã xóa "${scenario.name}"`,
                            color: 'red',
                            autoClose: 3000
                          });
                        }}
                      >
                        <IconTrash size={14} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Group>

                {/* Description */}
                <Text c="dimmed" size="xs" mb="sm">
                  {scenario.description}
                </Text>

                {/* Actions Preview */}
                <Group mb="md" gap="xs">
                  {scenario.actions.slice(0, 3).map((action, index) => (
                    <Tooltip key={index} label={action.description}>
                      <ThemeIcon size="xs" variant="light" color="blue">
                        {ACTION_ICONS[action.type]}
                      </ThemeIcon>
                    </Tooltip>
                  ))}
                  {scenario.actions.length > 3 && (
                    <Text c="dimmed" size="xs">
                      +{scenario.actions.length - 3} more
                    </Text>
                  )}
                </Group>

                {/* Stats */}
                <Group justify="space-between" mb="md">
                  <Text c="dimmed" size="xs">
                    Đã chạy: {scenario.usageCount} lần
                  </Text>
                  <Text c="dimmed" size="xs">
                    {scenario.actions.length} hành động
                  </Text>
                </Group>

                {/* Execute Button */}
                <Button
                  fullWidth
                  leftSection={<IconPlayerPlay size={14} />}
                  variant="light"
                  size="xs"
                  onClick={() => handleExecuteScenario(scenario)}
                  disabled={isExecuting}
                  loading={isExecuting}
                >
                  {isExecuting ? 'Đang thực thi...' : 'Chạy Kịch Bản'}
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal - Simplified for now */}
      <Modal
        opened={modalOpened}
        onClose={closeModal}
        title={isCreating ? "🆕 Tạo Kịch Bản Mới" : "✏️ Chỉnh Sửa Kịch Bản"}
        size="lg"
      >
        <Stack gap="md">
          <Alert color="blue" variant="light">
            <Text size="sm">
              💡 <strong>Đang phát triển:</strong> Giao diện tạo/chỉnh sửa kịch bản chi tiết sẽ được hoàn thiện trong phiên bản tiếp theo. 
              Hiện tại bạn có thể sử dụng các kịch bản có sẵn hoặc chờ cập nhật!
            </Text>
          </Alert>

          <Group justify="flex-end">
            <Button variant="light" onClick={closeModal}>
              Đóng
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
};

export default memo(ScenariosTab);
