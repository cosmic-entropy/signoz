import { Button } from 'antd';
import { GraphOnClickHandler } from 'components/Graph';
import Spinner from 'components/Spinner';
import TimePreference from 'components/TimePreferenceDropDown';
import GridGraphComponent from 'container/GridGraphComponent';
import {
	timeItems,
	timePreferance,
} from 'container/NewWidget/RightContainer/timeItems';
import { useGetQueryRange } from 'hooks/queryBuilder/useGetQueryRange';
import { getDashboardVariables } from 'lib/dashbaordVariables/getDashboardVariables';
import getChartData from 'lib/getChartData';
import { useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from 'store/reducers';
import { Widgets } from 'types/api/dashboard/getAll';
import { GlobalReducer } from 'types/reducer/globalTime';

import { TimeContainer } from './styles';

function FullView({
	widget,
	fullViewOptions = true,
	onClickHandler,
	name,
	yAxisUnit,
	onDragSelect,
}: FullViewProps): JSX.Element {
	const { selectedTime: globalSelectedTime } = useSelector<
		AppState,
		GlobalReducer
	>((state) => state.globalTime);

	const getSelectedTime = useCallback(
		() =>
			timeItems.find((e) => e.enum === (widget?.timePreferance || 'GLOBAL_TIME')),
		[widget],
	);

	const [selectedTime, setSelectedTime] = useState<timePreferance>({
		name: getSelectedTime()?.name || '',
		enum: widget?.timePreferance || 'GLOBAL_TIME',
	});

	const queryKey = useMemo(
		() =>
			`FullViewGetMetricsQueryRange-${selectedTime.enum}-${globalSelectedTime}-${widget.id}`,
		[selectedTime, globalSelectedTime, widget],
	);

	const response = useGetQueryRange(
		{
			selectedTime: selectedTime.enum,
			graphType: widget.panelTypes,
			query: widget.query,
			globalSelectedInterval: globalSelectedTime,
			variables: getDashboardVariables(),
		},
		{
			queryKey,
		},
	);

	const chartDataSet = useMemo(
		() =>
			getChartData({
				queryData: [
					{
						queryData: response?.data?.payload?.data?.result || [],
					},
				],
			}),
		[response],
	);

	const isLoading = response.isLoading === true;

	if (isLoading) {
		return <Spinner height="100%" size="large" tip="Loading..." />;
	}

	return (
		<>
			{fullViewOptions && (
				<TimeContainer>
					<TimePreference
						{...{
							selectedTime,
							setSelectedTime,
						}}
					/>
					<Button
						onClick={(): void => {
							response.refetch();
						}}
						type="primary"
					>
						Refresh
					</Button>
				</TimeContainer>
			)}

			<GridGraphComponent
				GRAPH_TYPES={widget.panelTypes}
				data={chartDataSet}
				isStacked={widget.isStacked}
				opacity={widget.opacity}
				title={widget.title}
				onClickHandler={onClickHandler}
				name={name}
				yAxisUnit={yAxisUnit}
				onDragSelect={onDragSelect}
			/>
		</>
	);
}

interface FullViewProps {
	widget: Widgets;
	fullViewOptions?: boolean;
	onClickHandler?: GraphOnClickHandler;
	name: string;
	yAxisUnit?: string;
	onDragSelect?: (start: number, end: number) => void;
}

FullView.defaultProps = {
	fullViewOptions: undefined,
	onClickHandler: undefined,
	yAxisUnit: undefined,
	onDragSelect: undefined,
};

export default FullView;
