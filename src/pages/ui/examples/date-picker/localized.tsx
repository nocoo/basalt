import { Button } from "@nocoo/basalt/components/button";
import { DatePicker } from "@nocoo/basalt/components/date-picker";
import { type FormEvent, useId, useState } from "react";

export default function DatePickerLocalized() {
	const id = useId();
	const [month, setMonth] = useState("2026-09");
	const [status, setStatus] = useState<string>("");

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const data = new FormData(event.currentTarget);
		const appointment = data.get("appointment")?.toString() || "";
		setStatus(`已确认预约日期：${appointment}`);
	};

	const handleReset = () => {
		setStatus("已重置表单");
	};

	return (
		<div className="space-y-4 max-w-sm">
			<form onSubmit={handleSubmit} onReset={handleReset} className="space-y-3">
				<div>
					<label htmlFor={id} className="block text-sm font-medium mb-1 text-basalt-foreground">
						服务预约时间
					</label>
					<DatePicker
						id={id}
						name="appointment"
						required
						month={month}
						onMonthChange={setMonth}
						locale="zh-CN"
						weekStartsOn={1}
						aria-label="预约日期"
						labels={{
							calendar: "预约日历",
							previousMonth: "上个月",
							nextMonth: "下个月",
							placeholder: "请选择预约日期",
							validationMessage: "请先选择有效的预约日期再提交",
							keyboardInstructions: "使用方向键在日期中移动，PageUp/PageDown切换月份，回车确认选择",
						}}
					/>
				</div>
				<div className="text-xs text-basalt-muted-foreground">
					当前显示月份：<span className="font-mono">{month}</span>
				</div>
				<div className="flex gap-2">
					<Button type="submit" variant="default" size="sm">
						确认预约
					</Button>
					<Button type="reset" variant="outline" size="sm">
						重置
					</Button>
				</div>
			</form>
			{status ? (
				<p role="status" className="text-xs text-basalt-foreground font-medium">
					{status}
				</p>
			) : null}
		</div>
	);
}
